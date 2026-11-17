package com.novaizuki.mobile;

import android.Manifest;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

/**
 * Izuki's own voice and ears on Android, and the Siri-style voice turn.
 *
 * The voice is Android's TextToSpeech: the WebView has no working speech
 * synthesis, so replies that weren't spoken by the cloud voice were silent.
 * It works with the app in the background and on the lock screen.
 *
 * The ears are Android's SpeechRecognizer, one short session at a time: for
 * the page's calls (it used to record and upload, and its own loudness gate
 * dropped quiet speech) and for the voice turn.
 *
 * A voice turn starts from "Hey Nova", a tap on the orb, the Quick Settings
 * tile or the notification, over whatever app is open:
 * greet ("Yes?", only after "Hey Nova" on its own) → listen → think (the words
 * go to the page as a "turn" event) → talk (the page's answer, spoken here)
 * → listen again if the answer asked something, else done. A tap on the orb
 * stops it. The page answers; this class only listens, speaks and shows the orb.
 * When the page isn't running, Izuki opens with the words instead.
 *
 * Everything here runs on the main looper.
 */
final class IzukiVoice {
  private IzukiVoice() { }

  private static final Handler ui = new Handler(Looper.getMainLooper());
  private static Context app;
  /** The page's hearing language ("" = the phone's) and the keep-orb setting, from the page. */
  static volatile String lang = "";
  static volatile boolean keepOrb = false;
  /** The glowing screen edges during a turn (Settings → Phone; on unless switched off). */
  static volatile boolean edgeGlow = true;

  private static void bind(Context c) {
    if (app == null && c != null) app = c.getApplicationContext();
  }

  // ---- the voice --------------------------------------------------------------

  private static TextToSpeech tts;
  private static boolean ttsReady = false;
  private static boolean ttsFailed = false;
  private static String ttsLang = "";
  private static final List<Runnable> afterInit = new ArrayList<>();
  /** What's being said now: its id, the id of its last piece, and its turn ("" for the page's own speech). */
  private static String speakingId = "";
  private static String speakingLast = "";
  private static String speakingTurn = "";

  private static void withTts(Runnable then) {
    if (ttsReady) { then.run(); return; }
    if (ttsFailed) { tts = null; ttsFailed = false; }
    afterInit.add(then);
    if (tts != null) return;
    tts = new TextToSpeech(app, status -> ui.post(() -> {
      if (status != TextToSpeech.SUCCESS || tts == null) {
        ttsFailed = true;
        if (tts != null) { try { tts.shutdown(); } catch (Exception ignored) { } }
        List<Runnable> waiting = new ArrayList<>(afterInit);
        afterInit.clear();
        for (Runnable r : waiting) r.run(); // they see ttsReady == false and report the failure
        return;
      }
      ttsReady = true;
      try {
        tts.setAudioAttributes(new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ASSISTANT)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
      } catch (Exception ignored) { }
      tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
        @Override public void onStart(String id) { IzukiAccessibilityService.voiceLevel(0.5f); ui.post(() -> started(id)); }
        // Each word Izuki says pulses the orb and the edges: they move with the voice.
        @Override public void onRangeStart(String id, int start, int end, int frame) {
          IzukiAccessibilityService.voiceLevel(0.45f + 0.5f * (float) Math.random());
        }
        @Override public void onDone(String id) { ui.post(() -> ended(id, "done")); }
        @Override public void onError(String id) { ui.post(() -> ended(id, "error")); }
        @Override public void onError(String id, int code) { ui.post(() -> ended(id, "error")); }
        @Override public void onStop(String id, boolean interrupted) { ui.post(() -> ended(id, "stopped")); }
      });
      List<Runnable> waiting = new ArrayList<>(afterInit);
      afterInit.clear();
      for (Runnable r : waiting) r.run();
    }));
  }

  private static void useLanguage() {
    String want = lang == null ? "" : lang;
    if (tts == null || want.equals(ttsLang)) return;
    Locale locale = want.isEmpty() ? Locale.getDefault() : Locale.forLanguageTag(want);
    try {
      if (tts.isLanguageAvailable(locale) >= TextToSpeech.LANG_AVAILABLE) tts.setLanguage(locale);
      else tts.setLanguage(Locale.getDefault());
    } catch (Exception ignored) { }
    ttsLang = want;
  }

  /** Is Izuki talking right now (native voice)? */
  static boolean speaking() { return !speakingId.isEmpty(); }

  /**
   * Say `text`. Events go to the page as {id, event: start|done|error|stopped};
   * `turnId` ties it to a voice turn (the orb shows it talking).
   */
  static void say(Context c, String text, String id, String turnId, float rate) {
    ui.post(() -> {
      bind(c);
      String words = text == null ? "" : text.trim();
      String uid = id == null || id.isEmpty() ? "say-" + System.currentTimeMillis() : id;
      if (words.isEmpty()) { IzukiControlPlugin.speechEvent(uid, "done"); return; }
      // A Stop (or the turn ending) while the voice engine is still starting
      // cancels this line too: it must not start talking afterwards.
      int gen = speechGen;
      withTts(() -> {
        if (gen != speechGen) { IzukiControlPlugin.speechEvent(uid, "stopped"); return; }
        speakNow(words, uid, turnId == null ? "" : turnId, rate);
      });
    });
  }

  /** Bumped by every Stop and turn end: lines still waiting for the engine are dropped. */
  private static int speechGen = 0;

  private static void speakNow(String words, String id, String turnId, float rate) {
    if (!ttsReady || tts == null) { IzukiControlPlugin.speechEvent(id, "error"); return; }
    // A line for a turn that's already over (stopped by a tap) stays unsaid.
    if (!turnId.isEmpty() && !turnId.equals(turn)) { IzukiControlPlugin.speechEvent(id, "stopped"); return; }
    // The voice engine took a moment to start and the turn already moved on to listening.
    if (id.startsWith("greet:") && !"greet".equals(phase)) { IzukiControlPlugin.speechEvent(id, "done"); return; }
    // A newer line replaces the old one, as the page's own voice does.
    if (!speakingId.isEmpty() && !speakingId.equals(id)) IzukiControlPlugin.speechEvent(speakingId, "stopped");
    useLanguage();
    try { tts.setSpeechRate(rate > 0.3f && rate < 3f ? rate : 1.0f); } catch (Exception ignored) { }
    List<String> parts = VoiceText.pieces(words, Math.min(3000, TextToSpeech.getMaxSpeechInputLength() - 50));
    speakingId = id;
    speakingTurn = turnId;
    speakingLast = id + "#" + (parts.size() - 1);
    IzukiWakeService.hold(IzukiWakeService.HOLD_SPEECH, true);
    boolean forTurn = !turn.isEmpty() && turn.equals(turnId);
    if (forTurn && !id.startsWith("greet:")) {
      phase = "talk";
      IzukiAccessibilityService.edgeGlow(edgeGlow, "talk");
      ui.removeCallbacks(pageTimeout);
      ui.removeCallbacks(afterTalk);
      long ms = Math.min(120_000, 6_000 + words.length() * 75L);
      IzukiAccessibilityService.orbFor("voice", "talk", VoiceText.caption(words, 160), ms);
    }
    for (int i = 0; i < parts.size(); i++) {
      Bundle params = new Bundle();
      int r = tts.speak(parts.get(i), i == 0 ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, params, id + "#" + i);
      if (r != TextToSpeech.SUCCESS) { ended(speakingLast, "error"); return; }
    }
  }

  private static void started(String uid) {
    if (uid == null || !uid.endsWith("#0")) return;
    String id = uid.substring(0, uid.length() - 2);
    if (id.equals(speakingId)) IzukiControlPlugin.speechEvent(id, "start");
  }

  private static void ended(String uid, String how) {
    if (uid == null || speakingId.isEmpty()) return;
    // A stop/error of any piece ends the whole line; "done" only on its last piece.
    if ("done".equals(how) && !uid.equals(speakingLast)) return;
    if (!uid.startsWith(speakingId + "#")) return;
    String id = speakingId;
    String forTurn = speakingTurn;
    speakingId = ""; speakingLast = ""; speakingTurn = "";
    IzukiWakeService.hold(IzukiWakeService.HOLD_SPEECH, false);
    IzukiControlPlugin.speechEvent(id, how);
    if (forTurn.isEmpty() || !forTurn.equals(turn)) return;
    if (id.startsWith("greet:")) { if ("greet".equals(phase)) listen(); return; }
    if (pendingDone != 0) {
      boolean follow = pendingDone == 2;
      pendingDone = 0;
      wrapUp(follow);
    } else {
      // The page normally says "done" right after the voice ends.
      ui.removeCallbacks(afterTalk);
      ui.postDelayed(afterTalk, 12_000);
    }
  }

  /** Stop talking now (the page's Stop, a tap on the orb). */
  static void hush() {
    ui.post(() -> {
      speechGen++;
      if (tts != null) { try { tts.stop(); } catch (Exception ignored) { } }
      if (!speakingId.isEmpty()) ended(speakingId + "#0", "stopped");
    });
  }

  // ---- the ears ---------------------------------------------------------------

  private static SpeechRecognizer ears;
  private static Consumer<String> earsPartial;
  private static BiConsumer<String, String> earsDone;
  private static String earsLast = "";
  private static final Runnable earsGiveUp = () -> {
    if (ears == null) return;
    finishEars(earsLast, earsLast.isEmpty() ? "silence" : "");
  };
  private static final Runnable earsTimeout = () -> {
    if (ears == null) return;
    try { ears.stopListening(); } catch (Exception ignored) { }
    ui.postDelayed(earsGiveUp, 2500);
  };

  static boolean hearing() { return ears != null; }

  /** One short listening session: `done(text, error)` exactly once ("" error = words heard). */
  private static void hear(long maxMs, Consumer<String> partial, BiConsumer<String, String> done) {
    finishEars("", "cancelled");
    if (app.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) { done.accept("", "permission"); return; }
    if (!SpeechRecognizer.isRecognitionAvailable(app)) { done.accept("", "unavailable"); return; }
    try { ears = SpeechRecognizer.createSpeechRecognizer(app); }
    catch (Exception e) { ears = null; done.accept("", "unavailable"); return; }
    earsPartial = partial;
    earsDone = done;
    earsLast = "";
    IzukiWakeService.hold(IzukiWakeService.HOLD_EARS, true);
    ears.setRecognitionListener(new RecognitionListener() {
      @Override public void onReadyForSpeech(Bundle b) { }
      @Override public void onBeginningOfSpeech() { }
      // The person's voice level (about -2…10 dB from Android) moves the orb and the edges.
      @Override public void onRmsChanged(float db) { IzukiAccessibilityService.voiceLevel(Math.max(0f, Math.min(1f, (db + 2f) / 12f))); }
      @Override public void onBufferReceived(byte[] buffer) { }
      @Override public void onEndOfSpeech() { }
      @Override public void onEvent(int type, Bundle b) { }
      @Override public void onPartialResults(Bundle b) {
        String t = best(b);
        if (t.isEmpty()) return;
        earsLast = t;
        Consumer<String> p = earsPartial;
        if (p != null) p.accept(t);
      }
      @Override public void onResults(Bundle b) {
        String t = best(b);
        if (t.isEmpty()) t = earsLast;
        finishEars(t, t.isEmpty() ? "silence" : "");
      }
      @Override public void onError(int error) {
        // Words already heard still count when the session ends with an error.
        if (!earsLast.isEmpty()) finishEars(earsLast, "");
        else finishEars("", VoiceText.errorWord(error));
      }
    });
    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        .putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, app.getPackageName())
        // How long a pause ends what you said: shorter answers sooner (it was 1.3 s).
        .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1000)
        .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 800);
    String want = lang == null ? "" : lang;
    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, want.isEmpty() ? Locale.getDefault().toLanguageTag() : want);
    try { ears.startListening(intent); }
    catch (Exception e) { finishEars("", "client"); return; }
    ui.removeCallbacks(earsTimeout);
    ui.postDelayed(earsTimeout, maxMs);
  }

  private static String best(Bundle b) {
    if (b == null) return "";
    ArrayList<String> words = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
    return words == null || words.isEmpty() || words.get(0) == null ? "" : words.get(0).trim();
  }

  private static void finishEars(String text, String error) {
    if (ears == null) return;
    ui.removeCallbacks(earsTimeout);
    ui.removeCallbacks(earsGiveUp);
    SpeechRecognizer r = ears;
    ears = null;
    try { r.cancel(); } catch (Exception ignored) { }
    try { r.destroy(); } catch (Exception ignored) { }
    IzukiWakeService.hold(IzukiWakeService.HOLD_EARS, false);
    BiConsumer<String, String> done = earsDone;
    earsDone = null;
    earsPartial = null;
    if (done != null) done.accept(text == null ? "" : text, error == null ? "" : error);
  }

  /** The page's call: one listening session, partial words as "hearing" events. */
  static void listenForPage(Context c, BiConsumer<String, String> done) {
    ui.post(() -> {
      bind(c);
      if (!turn.isEmpty()) { done.accept("", "busy"); return; }
      hear(20_000, IzukiControlPlugin::hearingEvent, done);
    });
  }

  static void stopListening() { ui.post(() -> finishEars("", "cancelled")); }

  /** "I'm done": stop listening and use what was heard (the recognizer sends its final words). */
  static void finishListening() {
    ui.post(() -> {
      if (ears == null) return;
      try { ears.stopListening(); } catch (Exception ignored) { }
      ui.removeCallbacks(earsGiveUp);
      ui.postDelayed(earsGiveUp, 2500);
    });
  }

  // ---- the voice turn -----------------------------------------------------------

  private static String turn = "";
  private static String phase = "";
  private static String source = "";
  private static boolean locked = false;
  private static boolean followUp = false;
  /** turnDone arrived while the reply was still being spoken: 1 = finish, 2 = listen again. */
  private static int pendingDone = 0;
  private static PowerManager.WakeLock screenHold;

  private static final Runnable pageTimeout = () -> {
    if (!turn.isEmpty() && "think".equals(phase)) finish("Izuki didn't answer in time. Open Izuki and try again.");
  };
  private static final Runnable afterTalk = () -> { if (!turn.isEmpty() && "talk".equals(phase)) finish(""); };
  private static final Runnable greetGuard = () -> { if ("greet".equals(phase)) listen(); };
  private static final Runnable hideLater = () -> {
    IzukiAccessibilityService.orbFor("voice", "idle", "");
    if (keepOrb) IzukiAccessibilityService.orbFor("page", "rest", "", 0);
  };

  static boolean active() { return !turn.isEmpty(); }

  /** Can a turn run without opening the app: the orb, the page, the microphone and a recognizer. */
  static boolean canTurn(Context c) {
    return IzukiAccessibilityService.running() && IzukiControlPlugin.alive()
        && c.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
        && SpeechRecognizer.isRecognitionAvailable(c);
  }

  /** A tap on the orb, the tile or the notification. */
  static void begin(Context c, String src) { ui.post(() -> { bind(c); start(src, ""); }); }

  /** "Hey Nova", with whatever was said after it in the same breath. */
  static void wake(Context c, String command) { ui.post(() -> { bind(c); start("wake", command == null ? "" : command.trim()); }); }

  /** The orb was tapped: start a turn, or stop what's running (a turn, or the page's own work). */
  static void tap(Context c) {
    ui.post(() -> {
      bind(c);
      if (active()) stop();
      else if (IzukiAccessibilityService.pageWorking()) {
        // The orb says "Tap to stop" over the page's reply or phone agent run.
        IzukiControlPlugin.pageStop();
        hush();
      } else start("orb", "");
    });
  }

  private static void start(String src, String command) {
    if (!canTurn(app)) { openApp(src, command); return; }
    if (active()) {
      // A new wake or tap replaces the old turn; the page drops its request.
      IzukiControlPlugin.turnCancelled(turn);
      end();
    }
    ui.removeCallbacks(hideLater);
    turn = UUID.randomUUID().toString();
    source = src;
    followUp = false;
    pendingDone = 0;
    KeyguardManager km = (KeyguardManager) app.getSystemService(Context.KEYGUARD_SERVICE);
    locked = km != null && km.isKeyguardLocked();
    IzukiWakeService.hold(IzukiWakeService.HOLD_TURN, true);
    IzukiAccessibilityService.edgeGlow(edgeGlow, "listen");
    holdScreen(true);
    if ("tile".equals(src)) IzukiAccessibilityService.perform("close_shade");
    if (!command.isEmpty()) { deliver(command); return; }
    if ("wake".equals(src)) {
      // "Hey Nova" on its own: answer like a person turning round, then listen.
      phase = "greet";
      String hi = VoiceText.greeting(System.currentTimeMillis());
      IzukiAccessibilityService.orbFor("voice", "listen", hi, 15_000);
      ui.postDelayed(greetGuard, 2500);
      say(app, hi, "greet:" + turn, turn, 1.05f);
      return;
    }
    listen();
  }

  private static void listen() {
    if (turn.isEmpty()) return;
    ui.removeCallbacks(greetGuard);
    phase = "listen";
    IzukiAccessibilityService.edgeGlow(edgeGlow, "listen");
    // Never listen while "Yes?" is still playing: the recognizer would hear it.
    if (speakingId.startsWith("greet:") && tts != null) {
      try { tts.stop(); } catch (Exception ignored) { }
      ended(speakingId + "#0", "stopped");
    }
    String mine = turn;
    IzukiAccessibilityService.orbFor("voice", "listen", followUp ? "Go on…" : "Listening…", 15_000);
    hear(10_000,
        (partial) -> { if (mine.equals(turn) && "listen".equals(phase)) IzukiAccessibilityService.orbFor("voice", "listen", VoiceText.caption(partial, 120), 15_000); },
        (text, error) -> {
          if (!mine.equals(turn) || !"listen".equals(phase)) return;
          if (!text.isEmpty()) { deliver(text); return; }
          if ("cancelled".equals(error)) return;
          // After an answer, silence just means "that's all".
          finish("silence".equals(error) && followUp ? "" : VoiceText.sayError(error));
        });
  }

  private static void deliver(String text) {
    phase = "think";
    IzukiAccessibilityService.edgeGlow(edgeGlow, "think");
    IzukiAccessibilityService.orbFor("voice", "think", "“" + VoiceText.caption(text, 90) + "”", 30_000);
    if (!IzukiControlPlugin.sendTurn(turn, text, locked, source, followUp)) {
      String src = source;
      end();
      hideNow();
      openApp(src, text);
      return;
    }
    ui.removeCallbacks(pageTimeout);
    ui.postDelayed(pageTimeout, 90_000);
  }

  /** The page's progress during a turn ("Opening Settings…"): the orb shows it. */
  static void state(String id, String state, String text) {
    ui.post(() -> {
      if (turn.isEmpty() || !turn.equals(id) || "talk".equals(phase)) return;
      phase = "think";
      String s = "listen".equals(state) || "talk".equals(state) ? state : "think";
      IzukiAccessibilityService.orbFor("voice", s, VoiceText.caption(text == null ? "" : text, 120), 30_000);
      ui.removeCallbacks(pageTimeout);
      ui.postDelayed(pageTimeout, 90_000);
    });
  }

  /** The page answered: finish, or listen again because the answer asked something. */
  static void done(String id, boolean follow) {
    ui.post(() -> {
      if (turn.isEmpty() || !turn.equals(id)) return;
      if (turn.equals(speakingTurn) && !speakingId.isEmpty()) { pendingDone = follow ? 2 : 1; return; }
      wrapUp(follow);
    });
  }

  private static void wrapUp(boolean follow) {
    ui.removeCallbacks(afterTalk);
    ui.removeCallbacks(pageTimeout);
    if (follow) { followUp = true; listen(); return; }
    finish("");
  }

  /** A tap on the orb mid-turn: stop listening, talking and the page's request. */
  private static void stop() {
    IzukiControlPlugin.turnCancelled(turn);
    if (turn.equals(speakingTurn) && tts != null) { try { tts.stop(); } catch (Exception ignored) { } }
    finish("Stopped.");
  }

  private static void finish(String caption) {
    if (turn.isEmpty()) return;
    end();
    if (caption != null && !caption.isEmpty()) {
      IzukiAccessibilityService.orbFor("voice", "rest", caption, 0);
      ui.postDelayed(hideLater, 3500);
    } else {
      ui.postDelayed(hideLater, 1500);
    }
  }

  private static void hideNow() {
    ui.removeCallbacks(hideLater);
    IzukiAccessibilityService.orbFor("voice", "idle", "");
  }

  private static void end() {
    // The turn is over before anything is cleaned up, so no completion
    // handler (a "Yes?" that just finished, a recognizer's last callback)
    // can start listening again during the teardown.
    String old = turn;
    turn = ""; phase = ""; source = ""; followUp = false; pendingDone = 0;
    speechGen++;
    finishEars("", "cancelled");
    if (!speakingTurn.isEmpty() && speakingTurn.equals(old) && tts != null) {
      try { tts.stop(); } catch (Exception ignored) { }
      ended(speakingId + "#0", "stopped");
    }
    ui.removeCallbacks(pageTimeout);
    ui.removeCallbacks(afterTalk);
    ui.removeCallbacks(greetGuard);
    IzukiWakeService.hold(IzukiWakeService.HOLD_TURN, false);
    holdScreen(false);
    IzukiAccessibilityService.edgeGlow(false, "");
  }

  /** The screen stays on while a turn runs (a lock screen dims after a few seconds). */
  @SuppressWarnings("deprecation")
  private static void holdScreen(boolean on) {
    try {
      if (on) {
        PowerManager pm = (PowerManager) app.getSystemService(Context.POWER_SERVICE);
        if (pm == null || !pm.isInteractive()) return;
        if (screenHold == null) {
          screenHold = pm.newWakeLock(PowerManager.SCREEN_BRIGHT_WAKE_LOCK, "izuki:turn");
          screenHold.setReferenceCounted(false);
        }
        screenHold.acquire(90_000);
      } else if (screenHold != null && screenHold.isHeld()) {
        screenHold.release();
      }
    } catch (Exception ignored) { }
  }

  /**
   * Without a running page (or without Android control), Izuki opens with the
   * words, the way it always has: the page answers once it is up.
   */
  private static void openApp(String src, String command) {
    if (!"wake".equals(src)) IzukiControlPlugin.setWakeAudio(null);
    String phrase = command == null || command.isEmpty() ? "Hey Nova" : "Hey Nova, " + command;
    String token = IzukiControlPlugin.beginWake(phrase);
    IzukiControlPlugin.notifyWake(phrase);
    Intent open = new Intent(app, MainActivity.class)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        .putExtra("izuki_wake_token", token);
    try { app.startActivity(open); } catch (Exception ignored) { }
  }
}
