package com.novaizuki.mobile;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.graphics.drawable.Icon;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.ParcelFileDescriptor;
import android.os.PowerManager;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.system.ErrnoException;
import android.system.Os;
import android.system.OsConstants;
import java.io.FileDescriptor;
import java.text.SimpleDateFormat;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Optional "Hey Nova" listening, only while the person has switched it on.
 *
 * A foreground service with a persistent notification, so it is never a
 * secret listener. The microphone is read here, quietly (no sound, and no
 * Bluetooth headset switching into call mode), and only when someone speaks
 * does Android's speech recognizer get a short session to check for the wake
 * phrase. The old version restarted the recognizer every few hundred
 * milliseconds for ever, and every restart played its start sound.
 *
 * States and the rules between them live in {@link WakeGate}: it never loops,
 * backs off after errors, stops with a reason after repeated failures, and
 * steps aside while the Izuki app is open (the page owns the microphone
 * there) or a call is running. A wake wakes the screen, but it never
 * dismisses the lock screen or runs a phone action while locked.
 */
public class IzukiWakeService extends Service implements RecognitionListener {
  public static final String ACTION_START = "com.novaizuki.mobile.WAKE_START";
  public static final String ACTION_STOP = "com.novaizuki.mobile.WAKE_STOP";
  public static final String ACTION_PAUSE = "com.novaizuki.mobile.WAKE_PAUSE";
  public static final String ACTION_RESUME = "com.novaizuki.mobile.WAKE_RESUME";
  public static final String ACTION_RETRY = "com.novaizuki.mobile.WAKE_RETRY";
  /** The notification's "Ask Izuki": a voice turn from anywhere, the lock screen included. */
  public static final String ACTION_ASK = "com.novaizuki.mobile.WAKE_ASK";
  private static final String CHANNEL = "izuki_wake";
  private static final int NOTIFY_ID = 7311;
  private static final String PREFS = "izuki_native";
  static final String KEY_WAKE = "wake_on";
  /** The person's own wake phrase, besides "Hey Nova" (see WakeGate.cleanPhrase). */
  static final String KEY_PHRASE = "wake_phrase";

  static String phrase(Context context) {
    return WakeGate.cleanPhrase(context.getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY_PHRASE, ""));
  }

  private static final int RATE = 16000;
  private static final int FRAME = 320; // 20 ms

  private static volatile IzukiWakeService self;
  /** MainActivity is resumed (shown in diagnostics; the listener keeps listening there). */
  private static volatile boolean appInFront = false;

  /**
   * Who is using the microphone or the speaker right now: the page's own
   * microphone, a voice turn, Izuki's native voice, a native listening
   * session. The listener steps aside while any of them holds it — and only
   * then. In 1.0.216 it paused whenever Izuki was open, so "Hey Nova" said
   * inside the app did nothing.
   */
  static final int HOLD_PAGE = 1, HOLD_TURN = 2, HOLD_SPEECH = 4, HOLD_EARS = 8, HOLD_CLIP = 16;
  private static int holds = 0;

  static void hold(int bit, boolean on) {
    IzukiWakeService s;
    synchronized (IzukiWakeService.class) {
      int before = holds;
      holds = on ? (holds | bit) : (holds & ~bit);
      if (before == holds) return;
      s = self;
    }
    if (s == null) return;
    // On the main thread, at once: the microphone must be closed before the
    // speech service opens its own one.
    if (Looper.myLooper() == Looper.getMainLooper()) s.arm();
    else s.main.post(s::arm);
  }

  private static synchronized int holds() { return holds; }
  /** Why the service last couldn't run, for the page and diagnostics (survives the service). */
  private static volatile String lastError = "";
  private static volatile long lastErrorAt = 0;
  private static final ArrayDeque<String> events = new ArrayDeque<>();

  private final Handler main = new Handler(Looper.getMainLooper());
  private final WakeGate gate = new WakeGate();
  private volatile WakeGate.State state = WakeGate.State.OFF;
  private long stateSince = System.currentTimeMillis();
  private boolean enabled;
  private long callHoldUntil;
  private long lastWake;
  private long lastWakeWall;
  /** Guards against several on/resume calls re-arming a live listener. */
  private long lastStartAt;
  private long retryAt;
  private long sessionStart;
  private int sessionCount;
  private boolean clipped;
  private boolean piped;
  private boolean budgetSpent;
  private boolean sourceRefused;
  private boolean onDeviceRefused;
  private boolean recognizerOnDevice;
  /**
   * Piped sessions in the current mode, and whether any of them returned a
   * single word. Some phones' on-device recognizers take Izuki's audio and
   * then return nothing, every time: "Hey Nova" could never match. After a
   * few sessions without one word, the next simpler mode is used.
   */
  private int pipedSessions;
  private boolean pipedWords;
  private boolean sessionWords;
  /**
   * The wake phrase seen in a partial result. The person may still be saying
   * the command ("Hey Nova, what's the weather in…"), so Izuki waits for the
   * final words and uses this only if none come.
   */
  private String partialWake = "";
  /** When the diagnostics last said why speech wasn't checked. */
  private long lastSkipNote = -60_000;
  private String noteText = "";
  private SpeechRecognizer recognizer;

  // The microphone, read on its own thread.
  private final Object audio = new Object();
  private AudioRecord record;
  private Thread reader;
  private volatile boolean reading;
  private volatile double level = -96;
  // The last three seconds: one before speech for the recognizer, and the
  // whole wake phrase for voice match.
  private final short[] ring = new short[RATE * 3];
  private int ringAt;
  private boolean ringFull;
  private FileDescriptor feed; // the recognizer's audio, while a piped session runs
  private ParcelFileDescriptor feedWrite;
  private ParcelFileDescriptor feedRead;

  private final Runnable rearm = this::arm;
  private final Runnable sessionTimeout = () -> {
    if (state != WakeGate.State.HEARING) return;
    // Ask for whatever it has; if nothing comes, give up on this session.
    try { if (recognizer != null) recognizer.stopListening(); } catch (Exception ignored) { }
    main.postDelayed(this::abandonSession, 1500);
  };
  private final Runnable handoffTimeout = () -> {
    if (state != WakeGate.State.DETECTED) return;
    // Izuki didn't come to the front (blocked, or the person ignored it):
    // listen again rather than staying deaf.
    log("Izuki didn't open after the wake; listening again");
    arm();
  };

  // ---- the outside world ---------------------------------------------------

  static boolean wanted(Context context) {
    return context.getSharedPreferences(PREFS, MODE_PRIVATE).getBoolean(KEY_WAKE, false);
  }

  public static boolean isRunning() {
    IzukiWakeService s = self;
    return s != null && s.state != WakeGate.State.OFF && s.state != WakeGate.State.STOPPING;
  }

  /** Is the microphone actually being read right now (armed or hearing)? */
  static boolean micOpen() {
    IzukiWakeService s = self;
    return s != null && s.reading;
  }

  static void start(Context context) {
    // An explicit start is the person asking (the page's switch, the tile, the
    // notification, or opening Izuki with the switch already on). This is the
    // only place the saved switch is written on: an internal restart must never
    // turn it back on after it was switched off.
    context.getApplicationContext().getSharedPreferences(PREFS, MODE_PRIVATE)
        .edit().putBoolean(KEY_WAKE, true).apply();
    IzukiWakeService s = self;
    if (s != null && !s.stopping) {
      Context app = context.getApplicationContext();
      // Checked again when it runs: a stop may have come first.
      s.main.post(() -> {
        try {
          if (self == s && !s.stopping) s.startAgain();
          else startThroughAndroid(app);
        } catch (Exception e) {
          remember("Android didn't let the listener start: " + e.getClass().getSimpleName());
        }
      });
      return;
    }
    startThroughAndroid(context);
  }

  private static void startThroughAndroid(Context context) {
    Intent intent = new Intent(context, IzukiWakeService.class).setAction(ACTION_START);
    if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(intent);
    else context.startService(intent);
  }

  static void stop(Context context) {
    IzukiWakeService s = self;
    if (s != null) { s.main.post(() -> s.shutDown(true)); return; }
    context.getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean(KEY_WAKE, false).apply();
  }

  /** Stop competing with a live call's microphone, without forgetting the switch. */
  static void pause(Context context, long ms) {
    long hold = Math.max(30_000L, Math.min(ms, 3_600_000L));
    IzukiWakeService s = self;
    if (s != null) s.main.post(() -> { s.callHoldUntil = SystemClock.elapsedRealtime() + hold; s.log("paused for a call"); s.arm(); });
  }

  static void resume(Context context) {
    IzukiWakeService s = self;
    if (s != null) { s.main.post(() -> { s.callHoldUntil = 0; s.arm(); }); return; }
    if (wanted(context)) start(context);
  }

  /**
   * MainActivity calls this as it comes to the front and leaves. The listener
   * keeps listening while Izuki is open; it only steps aside while the page
   * actually uses the microphone (see {@link #hold}). Starting here also
   * brings the listener back after a reboot or an Android stop: a microphone
   * service may only start while the app is in front.
   */
  static void foreground(Context context, boolean front) {
    appInFront = front;
    IzukiWakeService s = self;
    if (s != null) { s.main.post(s::arm); return; }
    if (front && wanted(context)) {
      try { start(context); } catch (Exception e) { remember("Android didn't let the listener start: " + e.getClass().getSimpleName()); }
    }
  }

  /** Everything the page and the diagnostics screen show, without words anyone said. */
  static JSONObject status(Context context) {
    JSONObject out = new JSONObject();
    try {
      IzukiWakeService s = self;
      out.put("on", wanted(context));
      out.put("running", isRunning());
      out.put("state", s == null ? "OFF" : s.state.name());
      out.put("since", s == null ? 0 : s.stateSince);
      out.put("mic", context.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED);
      out.put("micOpen", micOpen());
      out.put("appInFront", appInFront);
      out.put("lastError", lastError);
      out.put("phrase", phrase(context));
      out.put("lastErrorAt", lastErrorAt);
      if (s != null) {
        long now = SystemClock.elapsedRealtime();
        out.put("mode", s.state == WakeGate.State.HEARING ? (s.piped ? "audio-source" : "microphone") : "");
        out.put("level", Math.round(s.level));
        out.put("floor", Math.round(s.gate.floorDb()));
        out.put("sessions", s.sessionCount);
        out.put("failures", s.gate.failures());
        out.put("retryIn", s.retryAt > now ? s.retryAt - now : 0);
        out.put("quietFor", s.gate.quietUntil() > now ? s.gate.quietUntil() - now : 0);
        out.put("callPaused", s.callHoldUntil > now);
        out.put("lastWakeAt", s.lastWakeWall);
        out.put("note", s.noteText);
      }
      JSONArray log = new JSONArray();
      synchronized (events) { for (String line : events) log.put(line); }
      out.put("events", log);
    } catch (Exception ignored) { }
    return out;
  }

  private static void remember(String error) {
    lastError = error == null ? "" : error;
    lastErrorAt = System.currentTimeMillis();
    addEvent("error: " + lastError);
  }

  private static void addEvent(String text) {
    String at = new SimpleDateFormat("HH:mm:ss", Locale.ROOT).format(new Date());
    synchronized (events) {
      events.addLast(at + " " + text);
      while (events.size() > 30) events.removeFirst();
    }
  }

  private void log(String text) { addEvent(text); }

  // ---- lifecycle ---------------------------------------------------------------

  @Override public void onCreate() {
    super.onCreate();
    self = this;
    createChannel();
  }

  @Override public int onStartCommand(Intent intent, int flags, int startId) {
    // Android restarting a killed service hands over an intent with no action
    // (or none at all). That is not the person switching “Hey Nova” on:
    // startAgain() writes the switch back to true, so the listener came back
    // after being turned off and its microphone chimed open and shut again.
    // Every real start names ACTION_START, so a nameless one honours the switch.
    if ((intent == null || intent.getAction() == null) && !wanted(this)) {
      stopSelf();
      return START_NOT_STICKY;
    }
    String action = intent == null || intent.getAction() == null ? ACTION_START : intent.getAction();
    if (ACTION_STOP.equals(action)) {
      shutDown(true);
      return START_NOT_STICKY;
    }
    // A start that arrived while stopping: this instance carries on.
    stopping = false;
    try {
      startInForeground("Starting “Hey Nova”…");
    } catch (Exception e) {
      // Android 14+ refuses a microphone service started from the background
      // (after a reboot, for example). Keep the person's switch on and say
      // so; opening Izuki starts it again (see foreground()).
      remember("Android paused “Hey Nova” until Izuki is opened again.");
      self = null;
      stopSelf();
      return START_NOT_STICKY;
    }
    if (ACTION_PAUSE.equals(action) && intent != null) {
      callHoldUntil = SystemClock.elapsedRealtime() + Math.max(30_000L, Math.min(intent.getLongExtra("pause_ms", 600_000L), 3_600_000L));
    } else if (ACTION_RESUME.equals(action)) {
      callHoldUntil = 0;
    } else if (ACTION_RETRY.equals(action)) {
      gate.reset();
    } else if (ACTION_ASK.equals(action)) {
      IzukiVoice.begin(this, "notification");
    }
    startAgain();
    return START_STICKY;
  }

  /** On (again): idempotent, so a second Start never opens a second microphone. */
  private void startAgain() {
    // No switch write here: start() does that for a real start, so a restart
    // after a kill cannot resurrect a listener the person turned off.
    enabled = true;
    stopping = false;
    if (terminal) { terminal = false; retryAt = 0; gate.reset(); }
    if (!SpeechRecognizer.isRecognitionAvailable(this)) {
      fail(WakeGate.Failure.UNAVAILABLE, "Android's speech recognition isn't available on this phone.");
      return;
    }
    long now = SystemClock.elapsedRealtime();
    // The listener is already running: a repeated on/resume must not cancel
    // the session or reopen the microphone. That cancel/reopen pair was the
    // "connecting / disconnecting" sound the old app made over and over.
    if (state == WakeGate.State.ARMED || state == WakeGate.State.HEARING || state == WakeGate.State.PAUSED) {
      showState();
      return;
    }
    if (state == WakeGate.State.QUIET) { arm(); return; }
    // Even an ERROR is not reset instantly: several on/resume calls must not
    // wipe the backoff and turn it into a retry loop.
    if (now - lastStartAt < 1500) return;
    lastStartAt = now;
    if (state == WakeGate.State.OFF) move(WakeGate.State.STARTING);
    if (state == WakeGate.State.ERROR) {
      gate.reset();
      lastError = "";
      if (!move(WakeGate.State.STARTING)) return;
    }
    arm();
  }

  /** Set while stopping: a start now goes through Android (a fresh start), not this instance. */
  private volatile boolean stopping = false;

  /** This service's own timers; never the queued start/stop commands. */
  private void cancelTimers() {
    main.removeCallbacks(rearm);
    main.removeCallbacks(sessionTimeout);
    main.removeCallbacks(handoffTimeout);
  }

  private void shutDown(boolean byPerson) {
    if (byPerson) getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean(KEY_WAKE, false).apply();
    stopping = true;
    enabled = false;
    move(WakeGate.State.STOPPING);
    cancelTimers();
    endSession();
    closeMic();
    destroyRecognizer();
    IzukiAccessibilityService.orbFor("wake", "idle", "");
    try { stopForeground(true); } catch (Exception ignored) { }
    move(WakeGate.State.OFF);
    stopSelf();
  }

  @Override public void onDestroy() {
    enabled = false;
    cancelTimers();
    endSession();
    closeMic();
    destroyRecognizer();
    // Only take down the wake listener's own orb; Maps may still own it.
    IzukiAccessibilityService.orbFor("wake", "idle", "");
    if (state != WakeGate.State.OFF) {
      if (state != WakeGate.State.STOPPING) move(WakeGate.State.STOPPING);
      move(WakeGate.State.OFF);
    }
    try { stopForeground(true); } catch (Exception ignored) { }
    if (self == this) self = null;
    super.onDestroy();
  }

  @Override public IBinder onBind(Intent intent) { return null; }

  // ---- states --------------------------------------------------------------------

  private boolean move(WakeGate.State to) {
    if (state == to) return true;
    if (!WakeGate.canMove(state, to)) {
      log("refused " + state + " → " + to);
      return false;
    }
    log(state + " → " + to);
    state = to;
    stateSince = System.currentTimeMillis();
    showState();
    return true;
  }

  /** Listen (or stay paused / resting) according to everything that holds it back. */
  private void arm() {
    main.removeCallbacks(rearm);
    if (!enabled) return;
    long now = SystemClock.elapsedRealtime();
    if (state == WakeGate.State.HEARING) endSession();
    // Stopped after repeated failures: only "Try again" (or switching it
    // back on) starts it — not opening or leaving Izuki.
    if (terminal) {
      closeMic();
      move(WakeGate.State.ERROR);
      showState();
      return;
    }
    int held = holds();
    // Still backing off: keep the deadline; listen again only after it.
    if (retryAt > now && held == 0 && now >= callHoldUntil) {
      closeMic();
      move(WakeGate.State.ERROR);
      showState();
      main.postDelayed(rearm, retryAt - now + 50);
      return;
    }
    if (held != 0 || now < callHoldUntil) {
      closeMic();
      noteText = (held & HOLD_TURN) != 0 ? "Izuki is listening to you right now."
          : (held & HOLD_SPEECH) != 0 ? "Paused while Izuki talks."
          : held != 0 ? "Paused while Izuki uses the microphone." : "Paused during a call.";
      move(WakeGate.State.PAUSED);
      showState();
      if (held == 0) main.postDelayed(rearm, callHoldUntil - now + 50);
      return;
    }
    if (now < gate.quietUntil()) {
      closeMic();
      noteText = "Lots of talking nearby that wasn't “Hey Nova” — listening again in a couple of minutes.";
      move(WakeGate.State.QUIET);
      showState();
      main.postDelayed(rearm, gate.quietUntil() - now + 50);
      return;
    }
    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
      fail(WakeGate.Failure.PERMISSION, null);
      return;
    }
    if (!openMic()) {
      fail(WakeGate.Failure.AUDIO, "The microphone wouldn't open (another app may be using it).");
      return;
    }
    retryAt = 0;
    noteText = "";
    move(WakeGate.State.ARMED);
    showState();
  }

  /** A failure: back off and try again, or stop with the reason. Never a tight loop. */
  /** Stopped after repeated failures; cleared only by an explicit start or retry. */
  private boolean terminal = false;

  private void fail(WakeGate.Failure failure, String why) {
    endSession();
    closeMic();
    // The session that failed may have been the last of the budget: rest
    // after it, as a completed one would, instead of "armed" but refusing.
    if (budgetSpent) {
      synchronized (gate) { gate.rest(SystemClock.elapsedRealtime()); }
      budgetSpent = false;
    }
    long delay = gate.after(failure);
    String reason = why != null ? why : WakeGate.say(failure);
    if (delay < 0) {
      terminal = true;
      remember(reason);
      noteText = "“Hey Nova” stopped: " + reason + " Tap to try again.";
      move(WakeGate.State.ERROR);
      retryAt = 0;
      showState();
      return;
    }
    if (delay == 0) { arm(); return; }
    remember(reason + " Trying again in " + (delay / 1000) + " s.");
    noteText = reason + " Trying again shortly.";
    move(WakeGate.State.ERROR);
    retryAt = SystemClock.elapsedRealtime() + delay;
    showState();
    main.postDelayed(rearm, delay);
  }

  // ---- the microphone ------------------------------------------------------------

  private boolean openMic() {
    if (reading) return true;
    int min = AudioRecord.getMinBufferSize(RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
    if (min <= 0) return false;
    AudioRecord r;
    try {
      r = new AudioRecord(MediaRecorder.AudioSource.VOICE_RECOGNITION, RATE,
          AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, Math.max(min, FRAME * 2 * 10));
    } catch (Exception e) {
      return false;
    }
    if (r.getState() != AudioRecord.STATE_INITIALIZED) { r.release(); return false; }
    try { r.startRecording(); } catch (Exception e) { r.release(); return false; }
    if (r.getRecordingState() != AudioRecord.RECORDSTATE_RECORDING) { r.release(); return false; }
    synchronized (audio) {
      record = r;
      ringAt = 0;
      ringFull = false;
    }
    reading = true;
    reader = new Thread(() -> readLoop(r), "izuki-wake-mic");
    reader.start();
    return true;
  }

  private void closeMic() {
    reading = false;
    AudioRecord r;
    synchronized (audio) { r = record; record = null; }
    // Stop first (that ends a blocked read), let the reader leave, then release.
    if (r != null) {
      try { r.stop(); } catch (Exception ignored) { }
    }
    Thread t = reader;
    reader = null;
    if (t != null && t != Thread.currentThread()) {
      try { t.join(300); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
    }
    if (r != null) {
      try { r.release(); } catch (Exception ignored) { }
    }
  }

  private void readLoop(AudioRecord r) {
    short[] buf = new short[FRAME];
    byte[] bytes = new byte[FRAME * 2];
    while (reading) {
      int n;
      try { n = r.read(buf, 0, FRAME); } catch (Exception e) { n = -1; }
      if (!reading) break;
      if (n < 0) {
        main.post(() -> { if (reading) fail(WakeGate.Failure.AUDIO, "The microphone stopped giving sound."); });
        break;
      }
      if (n == 0) continue;
      synchronized (audio) {
        for (int i = 0; i < n; i++) {
          ring[ringAt] = buf[i];
          ringAt = (ringAt + 1) % ring.length;
          if (ringAt == 0) ringFull = true;
        }
        if (feed != null) {
          for (int i = 0; i < n; i++) { bytes[2 * i] = (byte) buf[i]; bytes[2 * i + 1] = (byte) (buf[i] >> 8); }
          if (!write(bytes, n * 2)) dropFeed();
        }
      }
      double db = WakeGate.levelDb(buf, n);
      level = db;
      if (state == WakeGate.State.ARMED) {
        boolean onset;
        synchronized (gate) { onset = gate.frame(db); }
        if (onset) main.post(this::onSpeech);
      }
    }
  }

  /** Non-blocking: a recognizer that never reads must not stall the microphone. */
  private boolean write(byte[] bytes, int length) {
    int off = 0;
    try {
      while (off < length) {
        int wrote = Os.write(feed, bytes, off, length - off);
        if (wrote <= 0) return false;
        off += wrote;
      }
      return true;
    } catch (ErrnoException e) {
      if (e.errno == OsConstants.EAGAIN) {
        sourceRefused = true; // nobody is reading the pipe: this recognizer opens its own mic
        addEvent("the recognizer didn't read Izuki's audio; using its own microphone from now on");
      }
      return false;
    } catch (Exception e) {
      return false;
    }
  }

  // ---- a recognizer session (only when someone speaks) ----------------------

  private void onSpeech() {
    if (state != WakeGate.State.ARMED || !enabled) return;
    long now = SystemClock.elapsedRealtime();
    synchronized (gate) {
      String why = gate.whyNot(now);
      if (!why.isEmpty()) {
        // Someone spoke and it wasn't checked: say why in the diagnostics (at most every 20 s).
        if (now - lastSkipNote > 20_000) { lastSkipNote = now; log("heard someone but didn't check: " + why); }
        return;
      }
      budgetSpent = gate.began(now);
    }
    if (!move(WakeGate.State.HEARING)) return;
    sessionCount++;
    sessionStart = now;
    sessionWords = false;
    partialWake = "";
    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        .putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toLanguageTag())
        .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
        .putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
        .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 900)
        .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 600);
    piped = Build.VERSION.SDK_INT >= 33 && !sourceRefused && attachFeed(intent);
    if (!piped) closeMic(); // the recognizer opens the microphone itself
    clipped = !piped;
    try {
      ensureRecognizer(piped);
      recognizer.startListening(intent);
    } catch (Exception e) {
      fail(WakeGate.Failure.CLIENT, "Android's speech service refused to start.");
      return;
    }
    main.postDelayed(sessionTimeout, piped ? 5000 : 7000);
  }

  /** Android 13+: hand the recognizer Izuki's own audio, with the second before speech began. */
  private boolean attachFeed(Intent intent) {
    if (Build.VERSION.SDK_INT < 33) return false;
    try {
      ParcelFileDescriptor[] pipe = ParcelFileDescriptor.createPipe();
      FileDescriptor fd = pipe[1].getFileDescriptor();
      Os.fcntlInt(fd, OsConstants.F_SETFL, OsConstants.O_NONBLOCK);
      synchronized (audio) {
        feedRead = pipe[0];
        feedWrite = pipe[1];
        feed = fd;
        // Only the last second: more would overfill the pipe before the
        // recognizer starts reading.
        int have = ringFull ? ring.length : ringAt;
        int count = Math.min(have, RATE);
        int start = (ringAt - count + ring.length) % ring.length;
        byte[] bytes = new byte[count * 2];
        for (int i = 0; i < count; i++) {
          short v = ring[(start + i) % ring.length];
          bytes[2 * i] = (byte) v;
          bytes[2 * i + 1] = (byte) (v >> 8);
        }
        if (count > 0 && !write(bytes, bytes.length)) { dropFeed(); return false; }
      }
      intent.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE, pipe[0]);
      intent.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_CHANNEL_COUNT, 1);
      intent.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_ENCODING, AudioFormat.ENCODING_PCM_16BIT);
      intent.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_SAMPLING_RATE, RATE);
      return true;
    } catch (Exception e) {
      dropFeed();
      return false;
    }
  }

  private void dropFeed() {
    synchronized (audio) {
      feed = null;
      try { if (feedWrite != null) feedWrite.close(); } catch (Exception ignored) { }
      try { if (feedRead != null) feedRead.close(); } catch (Exception ignored) { }
      feedWrite = null;
      feedRead = null;
    }
  }

  private void ensureRecognizer(boolean withFeed) {
    boolean onDevice = withFeed && !onDeviceRefused && Build.VERSION.SDK_INT >= 33
        && SpeechRecognizer.isOnDeviceRecognitionAvailable(this);
    if (recognizer != null && recognizerOnDevice == onDevice) return;
    destroyRecognizer();
    recognizer = onDevice && Build.VERSION.SDK_INT >= 33
        ? SpeechRecognizer.createOnDeviceSpeechRecognizer(this)
        : SpeechRecognizer.createSpeechRecognizer(this);
    recognizerOnDevice = onDevice;
    recognizer.setRecognitionListener(this);
  }

  private void destroyRecognizer() {
    if (recognizer == null) return;
    try { recognizer.cancel(); } catch (Exception ignored) { }
    try { recognizer.destroy(); } catch (Exception ignored) { }
    recognizer = null;
  }

  /** The session is over; the microphone stays as it is (the caller decides). */
  private void endSession() {
    main.removeCallbacks(sessionTimeout);
    dropFeed();
    if (state == WakeGate.State.HEARING) {
      try { if (recognizer != null) recognizer.cancel(); } catch (Exception ignored) { }
      synchronized (gate) { gate.ended(SystemClock.elapsedRealtime()); }
    }
  }

  /** Heard something that wasn't the wake phrase (or nothing): back to the quiet gate. */
  private void finishSession() {
    if (state != WakeGate.State.HEARING) return;
    // The final words never came (or lost the phrase): the partial one still woke Izuki.
    if (!partialWake.isEmpty()) { String text = partialWake; partialWake = ""; onWake(text); return; }
    if (piped) checkPipedMode();
    endSession();
    if (budgetSpent) {
      synchronized (gate) { gate.rest(SystemClock.elapsedRealtime()); }
      budgetSpent = false;
      log("resting: lots of speech nearby");
    }
    arm();
  }

  /** Four piped sessions in a row without a word: this mode doesn't work here, use the next one. */
  private void checkPipedMode() {
    if (sessionWords) pipedWords = true;
    if (pipedWords || ++pipedSessions < 4) return;
    if (recognizerOnDevice) {
      onDeviceRefused = true;
      log("the on-device recognizer returned no words in 4 sessions; using the regular one");
    } else {
      sourceRefused = true;
      log("the recognizer returned no words from Izuki's audio in 4 sessions; it opens its own microphone from now on");
    }
    pipedSessions = 0;
  }

  private void abandonSession() {
    if (state != WakeGate.State.HEARING) return;
    finishSession();
  }

  private void heard(Bundle results, boolean partial) {
    if (state != WakeGate.State.HEARING || results == null) return;
    ArrayList<String> words = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
    if (words != null) {
      for (String w : words) if (w != null && !w.trim().isEmpty()) { sessionWords = true; break; }
      for (String text : words) {
        if (WakeGate.isWake(text, clipped, phrase(this))) {
          if (partial) { partialWake = text; return; }
          onWake(text);
          return;
        }
      }
      if (!words.isEmpty()) synchronized (gate) { gate.worked(); }
      // Close but not the phrase ("hey noah"): only that it happened, never the words.
      if (!partial) for (String w : words) if (WakeGate.nearMiss(w)) { log("near miss: heard a greeting, but not the wake phrase"); break; }
    }
    if (!partial) finishSession();
  }

  private void onWake(String heard) {
    partialWake = "";
    long now = SystemClock.elapsedRealtime();
    endSession();
    closeMic();
    // Even the session that spent the budget: listening resumes normally after the turn.
    synchronized (gate) { gate.woke(); }
    budgetSpent = false;
    if (now - lastWake < 6000) { arm(); return; }
    lastWake = now;
    lastWakeWall = System.currentTimeMillis();
    move(WakeGate.State.DETECTED);
    noteText = "I'm here — open Izuki to talk.";
    showState();
    wakeScreen();
    vibrate();
    // Voice match on the page needs the phrase itself. Only a piped session
    // kept the microphone stream running through it; otherwise there's none.
    IzukiControlPlugin.setWakeAudio(piped ? wakeWav() : "");
    main.postDelayed(handoffTimeout, 20_000);
    // Siri-style: the orb pops up over whatever is open (or the lock screen),
    // listens and answers there, without opening Izuki. The turn holds the
    // microphone, so this listener pauses until it ends.
    if (IzukiVoice.canTurn(this)) {
      log("wake → voice turn over the current screen");
      IzukiVoice.wake(this, WakeGate.command(heard, clipped, phrase(this)));
      return;
    }
    log("wake → opening Izuki (Android control or the page isn't running)");
    // Without Android control or a running page: show the orb and open Izuki,
    // which does the listening.
    IzukiAccessibilityService.orbFor("wake", "rest", "Hey Nova — opening Izuki…", 30_000);
    String token = IzukiControlPlugin.beginWake(heard);
    IzukiControlPlugin.notifyWake(heard);
    Intent open = new Intent(this, MainActivity.class)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        .putExtra("izuki_wake_token", token);
    try { startActivity(open); } catch (Exception e) { log("Android didn't let Izuki open after the wake"); }
  }

  /** The last three seconds as a base64 WAV (16 kHz, 16-bit mono), for voice match. */
  private String wakeWav() {
    short[] pcm;
    synchronized (audio) {
      int have = ringFull ? ring.length : ringAt;
      int start = ringFull ? ringAt : 0;
      pcm = new short[have];
      for (int i = 0; i < have; i++) pcm[i] = ring[(start + i) % ring.length];
    }
    if (pcm.length < RATE / 2) return "";
    return android.util.Base64.encodeToString(WakeGate.wav(pcm, RATE), android.util.Base64.NO_WRAP);
  }

  // ---- RecognitionListener ---------------------------------------------------------

  @Override public void onReadyForSpeech(Bundle params) { }
  @Override public void onBeginningOfSpeech() { }
  @Override public void onRmsChanged(float rmsdB) { }
  @Override public void onBufferReceived(byte[] buffer) { }
  @Override public void onEndOfSpeech() { }
  @Override public void onResults(Bundle results) { heard(results, false); }
  @Override public void onPartialResults(Bundle partialResults) { heard(partialResults, true); }
  @Override public void onEvent(int eventType, Bundle params) { }

  @Override public void onError(int error) {
    // A cancel() of our own reports an error too: only the live session counts.
    if (state != WakeGate.State.HEARING) return;
    // The phrase was already heard in a partial result: that still counts.
    if (!partialWake.isEmpty()) { String text = partialWake; partialWake = ""; onWake(text); return; }
    WakeGate.Failure failure = WakeGate.classify(error);
    long took = SystemClock.elapsedRealtime() - sessionStart;
    if (piped && took < 1500 && (failure == WakeGate.Failure.CLIENT || failure == WakeGate.Failure.UNAVAILABLE)) {
      // This recognizer won't take Izuki's audio (or isn't on the device):
      // fall back once, without counting it as a failure.
      if (recognizerOnDevice) onDeviceRefused = true; else sourceRefused = true;
      // A new mode starts its own count of sessions without words.
      pipedSessions = 0;
      pipedWords = false;
      log("the recognizer refused Izuki's audio (" + error + "); falling back");
      finishSession();
      return;
    }
    if (failure == WakeGate.Failure.SILENCE) {
      synchronized (gate) { gate.after(WakeGate.Failure.SILENCE); }
      finishSession();
      return;
    }
    fail(failure, null);
  }

  // ---- the notification ------------------------------------------------------

  private void createChannel() {
    if (Build.VERSION.SDK_INT < 26) return;
    NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    if (nm == null) return;
    NotificationChannel channel = new NotificationChannel(CHANNEL, "Izuki wake word", NotificationManager.IMPORTANCE_LOW);
    channel.setDescription("Shows while Izuki is listening for “Hey Nova”.");
    channel.setShowBadge(false);
    channel.setSound(null, null);
    channel.enableVibration(false);
    nm.createNotificationChannel(channel);
  }

  private void startInForeground(String text) {
    Notification notification = notification(text, false);
    if (Build.VERSION.SDK_INT >= 29) {
      startForeground(NOTIFY_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
    } else {
      startForeground(NOTIFY_ID, notification);
    }
  }

  private String shownText = "";

  /** One quiet notification, changed only when what it says changes. */
  private void showState() {
    String text;
    switch (state) {
      case ARMED: text = "Listening for “Hey Nova”. Only a short check runs when someone speaks."; break;
      case HEARING: text = "Checking whether that was “Hey Nova”…"; break;
      case STARTING: text = "Starting “Hey Nova”…"; break;
      case OFF: case STOPPING: return;
      default: text = noteText.isEmpty() ? "“Hey Nova” is paused." : noteText;
    }
    if (text.equals(shownText)) return;
    shownText = text;
    NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    if (nm != null) {
      try { nm.notify(NOTIFY_ID, notification(text, state == WakeGate.State.ERROR && retryAt == 0)); } catch (Exception ignored) { }
    }
  }

  private Notification notification(String text, boolean offerRetry) {
    // Keep this an activity PendingIntent: Android 12+ blocks notification
    // trampolines that launch an activity from a broadcast receiver.
    Intent open = new Intent(this, MainActivity.class)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
    PendingIntent content = PendingIntent.getActivity(this, 0, open,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Intent stop = new Intent(this, IzukiWakeService.class).setAction(ACTION_STOP);
    PendingIntent stopIntent = PendingIntent.getService(this, 1, stop,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    // Works from the lock screen too: the orb listens and answers there
    // (general questions only until the phone is unlocked).
    Intent ask = new Intent(this, IzukiWakeService.class).setAction(ACTION_ASK);
    PendingIntent askIntent = PendingIntent.getService(this, 3, ask,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Notification.Builder b = Build.VERSION.SDK_INT >= 26
        ? new Notification.Builder(this, CHANNEL)
        : new Notification.Builder(this);
    b.setContentTitle("Izuki")
        .setContentText(text)
        .setStyle(new Notification.BigTextStyle().bigText(text))
        .setSmallIcon(android.R.drawable.ic_btn_speak_now)
        .setOngoing(true)
        .setOnlyAlertOnce(true)
        .setContentIntent(content)
        .addAction(new Notification.Action.Builder(Icon.createWithResource(this, android.R.drawable.ic_btn_speak_now), "Ask Izuki", askIntent).build())
        .addAction(new Notification.Action.Builder(Icon.createWithResource(this, android.R.drawable.ic_btn_speak_now), "Stop listening", stopIntent).build());
    if (offerRetry) {
      Intent retry = new Intent(this, IzukiWakeService.class).setAction(ACTION_RETRY);
      PendingIntent retryIntent = Build.VERSION.SDK_INT >= 26
          ? PendingIntent.getForegroundService(this, 2, retry, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE)
          : PendingIntent.getService(this, 2, retry, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
      b.addAction(new Notification.Action.Builder(Icon.createWithResource(this, android.R.drawable.ic_btn_speak_now), "Try again", retryIntent).build());
    }
    return b.build();
  }

  @SuppressWarnings("deprecation")
  private void wakeScreen() {
    try {
      PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
      if (pm == null) return;
      PowerManager.WakeLock lock = pm.newWakeLock(
          PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE,
          "izuki:wake");
      lock.acquire(5000);
    } catch (Exception ignored) { }
  }

  private void vibrate() {
    try {
      Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
      if (v == null) return;
      if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(180, VibrationEffect.DEFAULT_AMPLITUDE));
      else v.vibrate(180);
    } catch (Exception ignored) { }
  }
}
