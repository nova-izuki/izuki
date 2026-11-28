package com.novaizuki.mobile;

import android.Manifest;
import android.app.ActivityManager;
import android.app.AppOpsManager;
import android.app.KeyguardManager;
import android.app.NotificationManager;
import android.app.UiModeManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.content.pm.Signature;
import android.content.pm.SigningInfo;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Build;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.FileOutputStream;
import android.media.AudioManager;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.os.BatteryManager;
import android.os.PowerManager;
import android.os.SystemClock;
import android.speech.SpeechRecognizer;
import android.provider.Settings;
import android.view.KeyEvent;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.json.JSONObject;

/**
 * The companion's bridge to the device: on a phone, a few explicit actions;
 * on a TV, full control — see the screen, open any app, press, type,
 * scroll, play/pause, volume — always because the user asked. Plus finding
 * Izuki on the PC over the home Wi-Fi.
 */
@CapacitorPlugin(name = "IzukiControl")
public class IzukiControlPlugin extends Plugin {
  private final ExecutorService work = Executors.newCachedThreadPool();
  private static volatile IzukiControlPlugin instance;
  private static volatile String pendingWake = "";
  /** The wake phrase's audio (base64 WAV) for voice match, briefly. */
  private static volatile String wakeAudio = "";
  private static volatile long wakeAudioAt = 0;
  /** The latest wake came from a voice (not a tap on the tile): voice match applies. */
  private static volatile boolean wakeByVoice = false;

  /** From the wake listener: its audio ("" when it has none). null: a tap, not a voice. */
  static void setWakeAudio(String b64) {
    wakeAudio = b64 == null ? "" : b64;
    wakeByVoice = b64 != null;
    wakeAudioAt = System.currentTimeMillis();
  }

  /** Fresh (under 30 s) wake audio, used once. */
  private static String takeWakeAudio() {
    String a = System.currentTimeMillis() - wakeAudioAt < 30_000 ? wakeAudio : "";
    wakeAudio = "";
    return a;
  }
  private static String wakeToken = "";
  private AudioManager.OnAudioFocusChangeListener focusListener;

  @Override public void load() { instance = this; }

  @Override protected void handleOnDestroy() {
    if (instance == this) instance = null;
    super.handleOnDestroy();
  }

  /** Is Izuki's page running (it can answer a voice turn without opening)? */
  static boolean alive() {
    IzukiControlPlugin p = instance;
    return p != null && p.getBridge() != null && p.getBridge().getWebView() != null && p.hasListeners("turn");
  }

  /** Native speech progress for the page: {id, event: start|done|error|stopped}. */
  static void speechEvent(String id, String event) {
    IzukiControlPlugin p = instance;
    if (p == null) return;
    JSObject data = new JSObject();
    data.put("id", id);
    data.put("event", event);
    p.notifyListeners("speech", data, false);
  }

  /** Words heard so far in the page's native listening session. */
  static void hearingEvent(String text) {
    IzukiControlPlugin p = instance;
    if (p == null) return;
    JSObject data = new JSObject();
    data.put("text", text);
    p.notifyListeners("hearing", data, false);
  }

  /**
   * A voice turn's words for the page to answer. False when no page is
   * listening for turns (the caller opens Izuki with the words instead).
   */
  static boolean sendTurn(String id, String text, boolean locked, String source, boolean followUp) {
    return sendTurn(id, text, locked, source, followUp, null);
  }

  /**
   * `prelude` is the phone's own part of a wake turn, in ms from its start:
   * {age, greeting, first voice, first words, greeting cut, echoes ignored}.
   */
  static boolean sendTurn(String id, String text, boolean locked, String source, boolean followUp, long[] prelude) {
    IzukiControlPlugin p = instance;
    if (p == null || !p.hasListeners("turn")) return false;
    JSObject data = new JSObject();
    data.put("id", id);
    data.put("text", text);
    data.put("locked", locked);
    data.put("source", source);
    data.put("wake", "wake".equals(source) && !followUp);
    data.put("followUp", followUp);
    if (prelude != null && prelude.length >= 6) {
      JSObject phone = new JSObject();
      phone.put("age", prelude[0]);
      phone.put("greet", prelude[1]);
      phone.put("voice", prelude[2]);
      phone.put("heard", prelude[3]);
      phone.put("cut", prelude[4]);
      phone.put("echo", prelude[5]);
      data.put("prelude", phone);
    }
    p.notifyListeners("turn", data, false);
    return true;
  }

  /** A tap on the orb while the page itself is working or talking: stop that, don't start a new turn. */
  static void pageStop() {
    IzukiControlPlugin p = instance;
    if (p == null) return;
    p.notifyListeners("stop", new JSObject(), false);
  }

  /** The person stopped a turn (a tap on the orb, or a new wake): the page drops its request. */
  static void turnCancelled(String id) {
    IzukiControlPlugin p = instance;
    if (p == null || id == null || id.isEmpty()) return;
    JSObject data = new JSObject();
    data.put("id", id);
    p.notifyListeners("turnCancel", data, false);
  }

  // ---- Izuki's native voice and ears --------------------------------------------

  /** Say text with Android's voice. {text, id, turn, rate}; progress arrives as "speech" events. */
  @PluginMethod
  public void say(PluginCall call) {
    Double rate = call.getDouble("rate");
    IzukiVoice.say(getContext(), call.getString("text", ""), call.getString("id", ""),
        call.getString("turn", ""), rate == null ? 1.0f : rate.floatValue());
    call.resolve();
  }

  @PluginMethod
  public void hush(PluginCall call) {
    IzukiVoice.hush();
    call.resolve();
  }

  /**
   * A recorded line (Gemini's natural voice, a base64 WAV) played by Android:
   * {audio, text, id, turn}; the same "speech" events as say().
   */
  @PluginMethod
  public void playClip(PluginCall call) {
    IzukiVoice.playClip(getContext(), call.getString("audio", ""), call.getString("text", ""),
        call.getString("id", ""), call.getString("turn", ""));
    call.resolve();
  }

  /** The phone's voices for the picker, best first: {voices: [{name, label, online}]}. */
  @PluginMethod
  public void voices(PluginCall call) {
    IzukiVoice.voices(getContext(), (list) -> {
      JSArray out = new JSArray();
      for (String[] v : list) {
        JSObject o = new JSObject();
        o.put("name", v[0]);
        o.put("label", v[1]);
        o.put("online", "1".equals(v[2]));
        out.put(o);
      }
      JSObject r = new JSObject();
      r.put("voices", out);
      call.resolve(r);
    });
  }

  /** One listening session with Android's recognizer: {text, error}; partial words as "hearing" events. */
  @PluginMethod
  public void listen(PluginCall call) {
    if (!hasMicrophone()) { JSObject r = new JSObject(); r.put("text", ""); r.put("error", "permission"); call.resolve(r); return; }
    IzukiVoice.listenForPage(getContext(), (text, error) -> {
      JSObject r = new JSObject();
      r.put("text", text);
      r.put("error", error);
      call.resolve(r);
    });
  }

  /** {finish: true} ends the session keeping the words so far (a tap on "I'm done"); else drops them. */
  @PluginMethod
  public void stopListening(PluginCall call) {
    if (Boolean.TRUE.equals(call.getBoolean("finish", false))) IzukiVoice.finishListening();
    else IzukiVoice.stopListening();
    call.resolve();
  }

  /** The page's progress during a voice turn, shown on the orb. {id, state, text} */
  @PluginMethod
  public void turnState(PluginCall call) {
    IzukiVoice.state(call.getString("id", ""), call.getString("state", "think"), call.getString("text", ""));
    call.resolve();
  }

  /** The page finished a voice turn; `follow` listens again (the answer asked something). */
  @PluginMethod
  public void turnDone(PluginCall call) {
    IzukiVoice.done(call.getString("id", ""), Boolean.TRUE.equals(call.getBoolean("follow", false)));
    call.resolve();
  }

  /** The page opened (or closed) its own microphone: the wake listener steps aside meanwhile. */
  @PluginMethod
  public void micBusy(PluginCall call) {
    IzukiWakeService.hold(IzukiWakeService.HOLD_PAGE, Boolean.TRUE.equals(call.getBoolean("on", false)));
    call.resolve();
  }

  /** The keep-orb setting and the hearing language, for turns that run without the page in front. */
  @PluginMethod
  public void voicePrefs(PluginCall call) {
    Boolean keep = call.getBoolean("keep");
    if (keep != null) IzukiVoice.keepOrb = keep;
    String lang = call.getString("lang");
    if (lang != null) IzukiVoice.lang = lang.trim();
    Boolean glow = call.getBoolean("edgeGlow");
    if (glow != null) IzukiVoice.setEdgeGlow(glow);
    String voice = call.getString("voice");
    if (voice != null) IzukiVoice.voiceName = voice.trim();
    call.resolve();
  }

  /**
   * The glowing edges for the page's own work (a reply, the phone agent,
   * Autopilot): listen, think or talk for `lease` ms unless sent again; any
   * other state switches them off. {shown: false} when Android control is
   * off, so the page draws its own edges instead.
   */
  @PluginMethod
  public void glow(PluginCall call) {
    String state = call.getString("state", "");
    boolean on = IzukiVoice.edgeGlow && ("listen".equals(state) || "think".equals(state) || "talk".equals(state));
    long lease = Math.max(2_000, Math.min(120_000, call.getInt("lease", 30_000)));
    JSObject result = new JSObject();
    result.put("shown", IzukiAccessibilityService.glowFor("page", on, state, lease));
    call.resolve(result);
  }

  /**
   * One colour for the orb, everywhere — including the orb that floats over
   * other apps, which Android draws itself. "" puts Izuki's own palettes back.
   */
  @PluginMethod
  public void orbTint(PluginCall call) {
    IzukiAccessibilityService.orbTint(call.getString("color", ""));
    call.resolve();
  }

  private final android.os.Handler later = new android.os.Handler(android.os.Looper.getMainLooper());

  /**
   * A wait that isn't a page timer: a hidden WebView slows its timers down
   * (to once a minute after a while), which stalled the phone agent between
   * steps while Izuki was in the background.
   */
  @PluginMethod
  public void pause(PluginCall call) {
    int ms = Math.max(0, Math.min(15_000, call.getInt("ms", 300)));
    later.postDelayed(call::resolve, ms);
  }

  /** The phone's storage: {total, free} in bytes (no permission; nothing about files). */
  @PluginMethod
  public void storage(PluginCall call) {
    JSObject r = new JSObject();
    try {
      android.os.StatFs fs = new android.os.StatFs(android.os.Environment.getDataDirectory().getPath());
      long total = fs.getTotalBytes(), free = fs.getAvailableBytes();
      if (Build.VERSION.SDK_INT >= 26) {
        // The size the phone is sold as (what Settings shows), when Android tells it.
        try {
          android.app.usage.StorageStatsManager stats = (android.app.usage.StorageStatsManager) getContext().getSystemService(Context.STORAGE_STATS_SERVICE);
          if (stats != null) {
            total = stats.getTotalBytes(android.os.storage.StorageManager.UUID_DEFAULT);
            free = stats.getFreeBytes(android.os.storage.StorageManager.UUID_DEFAULT);
          }
        } catch (Exception ignored) { }
      }
      r.put("total", total);
      r.put("free", free);
      r.put("used", Math.max(0, total - free));
      call.resolve(r);
    } catch (Exception e) {
      call.reject("Couldn't read the storage: " + e.getMessage());
    }
  }

  /**
   * Straight to one Settings page or quick panel by name (wifi, internet,
   * bluetooth, volume, nfc, storage, battery, battery_saver, display, sound,
   * apps, notifications, location, data, dnd, about, date, language,
   * keyboard, airplane, camera, settings). Security and account pages are
   * deliberately not on the list.
   */
  @PluginMethod
  public void openPanel(PluginCall call) {
    if (IzukiAccessibilityService.locked(getContext())) { call.reject("locked"); return; }
    String name = call.getString("name", "").toLowerCase(Locale.ROOT).trim();
    Intent intent = panelIntent(name);
    if (intent == null) { call.reject("unknown"); return; }
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    try {
      getContext().startActivity(intent);
    } catch (Exception e) {
      try { getContext().startActivity(new Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); }
      catch (Exception again) { call.reject("Android didn't open that page."); return; }
      JSObject r = new JSObject();
      r.put("opened", "settings");
      call.resolve(r);
      return;
    }
    JSObject r = new JSObject();
    r.put("opened", name);
    call.resolve(r);
  }

  private static Intent panelIntent(String name) {
    boolean panels = Build.VERSION.SDK_INT >= 29;
    switch (name) {
      case "wifi": return new Intent(panels ? Settings.Panel.ACTION_WIFI : Settings.ACTION_WIFI_SETTINGS);
      case "internet": return new Intent(panels ? Settings.Panel.ACTION_INTERNET_CONNECTIVITY : Settings.ACTION_WIRELESS_SETTINGS);
      case "volume": return new Intent(panels ? Settings.Panel.ACTION_VOLUME : Settings.ACTION_SOUND_SETTINGS);
      case "nfc": return new Intent(panels ? Settings.Panel.ACTION_NFC : Settings.ACTION_NFC_SETTINGS);
      case "bluetooth": return new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
      case "storage": return new Intent(Settings.ACTION_INTERNAL_STORAGE_SETTINGS);
      case "battery": return new Intent(Intent.ACTION_POWER_USAGE_SUMMARY);
      case "battery_saver": return new Intent(Settings.ACTION_BATTERY_SAVER_SETTINGS);
      case "display": return new Intent(Settings.ACTION_DISPLAY_SETTINGS);
      case "sound": return new Intent(Settings.ACTION_SOUND_SETTINGS);
      case "apps": return new Intent(Settings.ACTION_MANAGE_APPLICATIONS_SETTINGS);
      case "notifications": return new Intent("android.settings.NOTIFICATION_SETTINGS");
      case "location": return new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
      case "data": return new Intent(Build.VERSION.SDK_INT >= 28 ? Settings.ACTION_DATA_USAGE_SETTINGS : Settings.ACTION_WIRELESS_SETTINGS);
      case "dnd": return new Intent("android.settings.ZEN_MODE_SETTINGS");
      case "about": return new Intent(Settings.ACTION_DEVICE_INFO_SETTINGS);
      case "date": return new Intent(Settings.ACTION_DATE_SETTINGS);
      case "language": return new Intent(Settings.ACTION_LOCALE_SETTINGS);
      case "keyboard": return new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS);
      case "airplane": return new Intent(Settings.ACTION_AIRPLANE_MODE_SETTINGS);
      case "camera": return new Intent(android.provider.MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA);
      case "settings": return new Intent(Settings.ACTION_SETTINGS);
      default: return null;
    }
  }

  private static volatile Boolean torchOn = null;
  private static volatile boolean torchWatched = false;

  /** The flashlight: {on} sets it, no `on` toggles it. Resolves {on}. No camera permission needed. */
  @PluginMethod
  public void torch(PluginCall call) {
    android.hardware.camera2.CameraManager cm = (android.hardware.camera2.CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
    if (cm == null) { call.reject("This phone has no flashlight."); return; }
    try {
      String id = null;
      for (String camera : cm.getCameraIdList()) {
        android.hardware.camera2.CameraCharacteristics c = cm.getCameraCharacteristics(camera);
        Boolean flash = c.get(android.hardware.camera2.CameraCharacteristics.FLASH_INFO_AVAILABLE);
        Integer facing = c.get(android.hardware.camera2.CameraCharacteristics.LENS_FACING);
        if (Boolean.TRUE.equals(flash) && (id == null || Integer.valueOf(android.hardware.camera2.CameraCharacteristics.LENS_FACING_BACK).equals(facing))) id = camera;
      }
      if (id == null) { call.reject("This phone has no flashlight."); return; }
      final String torchId = id;
      if (!torchWatched) {
        torchWatched = true;
        cm.registerTorchCallback(new android.hardware.camera2.CameraManager.TorchCallback() {
          @Override public void onTorchModeChanged(String cameraId, boolean enabled) { if (cameraId.equals(torchId)) torchOn = enabled; }
        }, later);
      }
      Boolean want = call.getBoolean("on");
      boolean on = want != null ? want : !Boolean.TRUE.equals(torchOn);
      cm.setTorchMode(id, on);
      torchOn = on;
      JSObject r = new JSObject();
      r.put("on", on);
      call.resolve(r);
    } catch (Exception e) {
      call.reject("The flashlight is busy (the camera may be in use).");
    }
  }

  /**
   * A short recording for "Teach my voice": 16 kHz mono WAV, base64, plus its
   * loudest level, recorded here (the WebView's MediaRecorder was unreliable).
   * The wake listener steps aside while it records. Nothing is kept.
   */
  @PluginMethod
  public void recordClip(PluginCall call) {
    if (!hasMicrophone()) { call.reject("mic"); return; }
    int ms = Math.max(1000, Math.min(8000, call.getInt("ms", 3500)));
    IzukiWakeService.hold(IzukiWakeService.HOLD_CLIP, true);
    work.execute(() -> {
      android.media.AudioRecord r = null;
      try {
        Thread.sleep(200); // let the wake listener close its microphone first
        int rate = 16000;
        int min = android.media.AudioRecord.getMinBufferSize(rate, android.media.AudioFormat.CHANNEL_IN_MONO, android.media.AudioFormat.ENCODING_PCM_16BIT);
        r = new android.media.AudioRecord(android.media.MediaRecorder.AudioSource.VOICE_RECOGNITION, rate,
            android.media.AudioFormat.CHANNEL_IN_MONO, android.media.AudioFormat.ENCODING_PCM_16BIT, Math.max(min, 6400));
        if (r.getState() != android.media.AudioRecord.STATE_INITIALIZED) throw new IllegalStateException("busy");
        r.startRecording();
        short[] pcm = new short[rate * ms / 1000];
        int at = 0;
        long until = SystemClock.elapsedRealtime() + ms + 1500;
        while (at < pcm.length && SystemClock.elapsedRealtime() < until) {
          int n = r.read(pcm, at, Math.min(1600, pcm.length - at));
          if (n < 0) throw new IllegalStateException("read");
          // The page's meter follows the voice while it records (every 100 ms).
          int loud = 0;
          for (int i = at; i < at + n; i++) loud = Math.max(loud, Math.abs((int) pcm[i]));
          JSObject level = new JSObject();
          level.put("level", loud / 32768.0);
          notifyListeners("clipLevel", level, false);
          at += n;
        }
        int peak = 0;
        for (int i = 0; i < at; i++) peak = Math.max(peak, Math.abs((int) pcm[i]));
        short[] got = at == pcm.length ? pcm : java.util.Arrays.copyOf(pcm, at);
        JSObject out = new JSObject();
        out.put("audio", android.util.Base64.encodeToString(WakeGate.wav(got, rate), android.util.Base64.NO_WRAP));
        out.put("type", "audio/wav");
        out.put("peak", peak / 32768.0);
        call.resolve(out);
      } catch (Exception e) {
        call.reject("The microphone is busy (another app may be using it).");
      } finally {
        if (r != null) { try { r.stop(); } catch (Exception ignored) { } try { r.release(); } catch (Exception ignored) { } }
        IzukiWakeService.hold(IzukiWakeService.HOLD_CLIP, false);
      }
    });
  }

  /**
   * Remember a wake phrase and mint a one-use hand-off token. Only our own
   * services/tile can call this; MainActivity refuses a wake without a token,
   * so an exported launcher entry cannot inject a phrase from another app.
   */
  static synchronized String beginWake(String phrase) {
    pendingWake = phrase == null ? "" : phrase;
    wakeToken = UUID.randomUUID().toString();
    return wakeToken;
  }

  /** True once, for the activity launch that belongs to the latest wake. */
  static synchronized boolean consumeWakeHandoff(String token) {
    if (token == null || token.isEmpty() || wakeToken.isEmpty() || !wakeToken.equals(token)) return false;
    wakeToken = "";
    return true;
  }

  /** Tell an already-open Izuki page that “Hey Nova” was heard. */
  static void notifyWake(String phrase) {
    IzukiControlPlugin p = instance;
    if (p == null) return;
    JSObject data = new JSObject();
    data.put("phrase", phrase == null ? "Hey Nova" : phrase);
    p.notifyListeners("wake", data, true);
  }

  /** The phone was unlocked: a wake that arrived behind the lock can now run. */
  static void notifyUnlock() {
    IzukiControlPlugin p = instance;
    if (p == null) return;
    p.notifyListeners("unlock", new JSObject(), true);
  }

  /** Izuki is back in front (often from Android Settings): re-check everything now. */
  static void notifyResume() {
    IzukiControlPlugin p = instance;
    if (p == null) return;
    p.notifyListeners("resume", new JSObject(), true);
  }

  /** Android connected or dropped Izuki's accessibility service. */
  static void notifyControl(boolean connected) {
    IzukiControlPlugin p = instance;
    if (p == null) return;
    JSObject data = new JSObject();
    data.put("connected", connected);
    p.notifyListeners("control", data, true);
  }

  /** Tell the Izuki page something happened on the TV (e.g. a paywall). */
  static void emit(String event, String app, String pkg, String say) {
    IzukiControlPlugin p = instance;
    if (p == null) return;
    JSObject data = new JSObject();
    data.put("app", app);
    data.put("id", pkg);
    data.put("say", say);
    p.notifyListeners(event, data, true);
  }

  /** Paywall guard on/off (remembered). */
  @PluginMethod
  public void watch(PluginCall call) {
    IzukiAccessibilityService.watch(getContext(), Boolean.TRUE.equals(call.getBoolean("on", false)));
    JSObject result = new JSObject();
    result.put("on", IzukiAccessibilityService.watching);
    result.put("running", IzukiAccessibilityService.running());
    call.resolve(result);
  }

  /** A picture of the screen: { image (base64 JPEG), type }. */
  @PluginMethod
  public void snapshot(PluginCall call) {
    if (IzukiAccessibilityService.locked(getContext())) { call.reject("locked"); return; }
    IzukiAccessibilityService.snapshot(image -> {
      JSObject result = new JSObject();
      result.put("image", image);
      result.put("type", "image/jpeg");
      result.put("w", IzukiAccessibilityService.shotW);
      result.put("h", IzukiAccessibilityService.shotH);
      call.resolve(result);
    }, call::reject);
  }

  private boolean hasMicrophone() {
    return getContext().checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
  }

  private boolean notificationsShown() {
    NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
    return nm != null && nm.areNotificationsEnabled();
  }

  /** Turn the opt-in “Hey Nova” listener on or off. */
  @PluginMethod
  public void wake(PluginCall call) {
    boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
    if (on && !SpeechRecognizer.isRecognitionAvailable(getContext())) {
      call.reject("Speech recognition isn't available on this phone.");
      return;
    }
    if (on && !hasMicrophone()) {
      call.reject("mic");
      return;
    }
    if (on && !notificationsShown()) {
      call.reject("notifications");
      return;
    }
    getContext().getSharedPreferences("izuki_native", Context.MODE_PRIVATE).edit()
        .putBoolean(IzukiWakeService.KEY_WAKE, on).apply();
    try {
      // Both are idempotent: a second "on" never opens a second microphone.
      if (on) IzukiWakeService.start(getContext());
      else IzukiWakeService.stop(getContext());
    } catch (Exception e) {
      getContext().getSharedPreferences("izuki_native", Context.MODE_PRIVATE).edit()
          .putBoolean(IzukiWakeService.KEY_WAKE, false).apply();
      call.reject("Couldn't start the wake listener: " + e.getMessage());
      return;
    }
    call.resolve(wakeInfo());
  }

  @PluginMethod
  public void wakeStatus(PluginCall call) {
    call.resolve(wakeInfo());
  }

  /**
   * The person's own wake phrase ("hey jarvis"), besides "Hey Nova". 2–4
   * words; an empty phrase goes back to just "Hey Nova". The listener reads
   * it on its next check, so no restart (and no microphone blip) is needed.
   */
  @PluginMethod
  public void setWakePhrase(PluginCall call) {
    String raw = call.getString("phrase", "");
    String problem = WakeGate.phraseProblem(raw);
    if (!problem.isEmpty()) {
      call.reject(problem);
      return;
    }
    String clean = WakeGate.cleanPhrase(raw);
    getContext().getSharedPreferences("izuki_native", Context.MODE_PRIVATE).edit()
        .putString(IzukiWakeService.KEY_PHRASE, clean).apply();
    call.resolve(wakeInfo());
  }

  /** The listener's real state (OFF, ARMED, PAUSED, ERROR…), not just the switch. */
  private JSObject wakeInfo() {
    JSObject result;
    try { result = JSObject.fromJSONObject(IzukiWakeService.status(getContext())); }
    catch (Exception e) { result = new JSObject(); }
    result.put("available", SpeechRecognizer.isRecognitionAvailable(getContext()));
    result.put("mic", hasMicrophone());
    result.put("notifications", notificationsShown());
    return result;
  }

  /** The live call needs the microphone; pause the hotword without turning it off. */
  @PluginMethod
  public void wakePause(PluginCall call) {
    if (!getContext().getSharedPreferences("izuki_native", Context.MODE_PRIVATE)
        .getBoolean(IzukiWakeService.KEY_WAKE, false)) {
      call.resolve();
      return;
    }
    int minutes = Math.max(1, Math.min(60, call.getInt("minutes", 30)));
    try { IzukiWakeService.pause(getContext(), minutes * 60_000L); }
    catch (Exception e) { call.reject("Couldn't pause the wake listener: " + e.getMessage()); return; }
    call.resolve();
  }

  @PluginMethod
  public void wakeResume(PluginCall call) {
    if (!getContext().getSharedPreferences("izuki_native", Context.MODE_PRIVATE)
        .getBoolean(IzukiWakeService.KEY_WAKE, false)) {
      call.resolve();
      return;
    }
    try { IzukiWakeService.resume(getContext()); }
    catch (Exception e) { call.reject("Couldn't resume the wake listener: " + e.getMessage()); return; }
    call.resolve();
  }

  @PluginMethod
  public void takeWake(PluginCall call) {
    JSObject result = new JSObject();
    result.put("phrase", pendingWake);
    pendingWake = "";
    // Whether it was a voice outlives its audio: an expired clip still means "check the command".
    result.put("voice", wakeByVoice);
    result.put("audio", takeWakeAudio());
    wakeByVoice = false;
    call.resolve(result);
  }

  /** Safe, non-personal device numbers for the cockpit: battery, network, sound. */
  @PluginMethod
  public void device(PluginCall call) {
    JSObject result = new JSObject();
    BatteryManager bm = (BatteryManager) getContext().getSystemService(Context.BATTERY_SERVICE);
    result.put("battery", bm == null ? -1 : bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY));
    result.put("charging", bm != null && bm.isCharging());
    ConnectivityManager cm = (ConnectivityManager) getContext().getSystemService(Context.CONNECTIVITY_SERVICE);
    NetworkCapabilities nc = cm == null ? null : cm.getNetworkCapabilities(cm.getActiveNetwork());
    result.put("online", nc != null && nc.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET));
    result.put("wifi", nc != null && nc.hasTransport(NetworkCapabilities.TRANSPORT_WIFI));
    KeyguardManager km = (KeyguardManager) getContext().getSystemService(Context.KEYGUARD_SERVICE);
    result.put("locked", km != null && km.isKeyguardLocked());
    PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
    result.put("screenOn", pm != null && pm.isInteractive());
    AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
    result.put("volume", am == null ? -1 : am.getStreamVolume(AudioManager.STREAM_MUSIC));
    result.put("volumeMax", am == null ? -1 : am.getStreamMaxVolume(AudioManager.STREAM_MUSIC));
    result.put("model", Build.MODEL);
    result.put("sdk", Build.VERSION.SDK_INT);
    result.put("width", getContext().getResources().getDisplayMetrics().widthPixels);
    result.put("height", getContext().getResources().getDisplayMetrics().heightPixels);
    result.put("control", IzukiAccessibilityService.running());
    call.resolve(result);
  }

  @PluginMethod
  public void haptic(PluginCall call) {
    getActivity().runOnUiThread(() -> {
      boolean done = getActivity().getWindow().getDecorView().performHapticFeedback(android.view.HapticFeedbackConstants.CLOCK_TICK);
      JSObject result = new JSObject();
      result.put("done", done);
      call.resolve(result);
    });
  }

  @PluginMethod
  public void status(PluginCall call) {
    JSObject result = new JSObject();
    result.put("enabled", IzukiAccessibilityService.isEnabled(getContext()));
    result.put("running", IzukiAccessibilityService.running());
    result.put("tv", isTv());
    try {
      PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
      result.put("version", info.versionName);
      result.put("versionCode", Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode);
      result.put("updateAllowed", Build.VERSION.SDK_INT < 26 || getContext().getPackageManager().canRequestPackageInstalls());
    } catch (Exception ignored) { }
    call.resolve(result);
  }

  // ---- updating itself ---------------------------------------------------------

  /**
   * Download, verify and hand a newer APK to Android's installer.
   * A partial file is never installable: the download lands in .part, is
   * checked against GitHub's size/SHA-256, package name and version, then
   * renamed. If Android returns "App not installed", the JS layer can say
   * why instead of pretending the update worked.
   */
  @PluginMethod
  public void installUpdate(PluginCall call) {
    String url = call.getString("url", "");
    Uri parsed = Uri.parse(url);
    if (!"https".equals(parsed.getScheme()) || !"github.com".equals(parsed.getHost())
        || parsed.getPath() == null || !parsed.getPath().startsWith("/nova-izuki/izuki/releases/")) {
      call.reject("not an Izuki update"); return;
    }
    if (Build.VERSION.SDK_INT >= 26 && !getContext().getPackageManager().canRequestPackageInstalls()) {
      // Android asks once: "allow Izuki to install updates".
      Intent allow = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
      allow.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(allow);
      call.reject("allow");
      return;
    }
    String expectedSha = String.valueOf(call.getString("sha256", "")).trim().toLowerCase(Locale.ROOT);
    if (!expectedSha.isEmpty() && !expectedSha.matches("[0-9a-f]{64}")) { call.reject("bad checksum"); return; }
    Double sizeArg = call.getDouble("size");
    long expectedSize = sizeArg == null ? 0L : sizeArg.longValue();
    String expectedVersion = String.valueOf(call.getString("version", "")).replaceFirst("^v", "").trim();
    work.execute(() -> {
      // Every attempt gets its own files: a second tap (for example on the TV
      // tile) can never delete or rename the first attempt's APK.
      String token = UUID.randomUUID().toString().replace("-", "");
      File part = new File(getContext().getCacheDir(), "izuki-update-" + token + ".part");
      File apk = new File(getContext().getCacheDir(), "izuki-update-" + token + ".apk");
      HttpURLConnection c = null;
      try {
        cleanOldUpdates();
        c = open(url);
        for (int hop = 0; hop < 6; hop++) {
          int status = c.getResponseCode();
          if (status >= 300 && status < 400) {
            String next = c.getHeaderField("Location");
            if (next == null || !next.startsWith("https://")) throw new Exception("GitHub's download link didn't lead anywhere.");
            c.disconnect();
            c = open(next);
            continue;
          }
          if (status != 200) throw new Exception("GitHub returned " + status + " for the update.");
          break;
        }
        long total = expectedSize > 0 ? expectedSize : c.getContentLengthLong();
        if (total > 250L * 1024 * 1024) throw new Exception("That update is unexpectedly large.");
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        long received = 0;
        int lastPercent = -2;
        try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(part)) {
          byte[] buf = new byte[65536];
          int n;
          while ((n = in.read(buf)) > 0) {
            out.write(buf, 0, n);
            digest.update(buf, 0, n);
            received += n;
            if (received > 250L * 1024 * 1024) throw new Exception("That update is unexpectedly large.");
            if (total > 0) {
              int percent = (int) Math.min(100, received * 100 / total);
              if (percent != lastPercent) {
                lastPercent = percent;
                JSObject progress = new JSObject();
                progress.put("percent", percent);
                progress.put("received", received);
                progress.put("total", total);
                try { notifyListeners("updateProgress", progress, true); } catch (Exception ignored) { }
              }
            }
          }
        }
        c.disconnect();
        if (expectedSize > 0 && received != expectedSize) throw new Exception("The download stopped early. Try again.");
        if (!expectedSha.isEmpty()) {
          String actual = hex(digest.digest());
          if (!actual.equals(expectedSha)) throw new Exception("The download didn't match GitHub's checksum. Try again.");
        }
        PackageManager pm = getContext().getPackageManager();
        int flags = Build.VERSION.SDK_INT >= 28 ? PackageManager.GET_SIGNING_CERTIFICATES : PackageManager.GET_SIGNATURES;
        PackageInfo archive = pm.getPackageArchiveInfo(part.getAbsolutePath(), flags);
        if (archive == null || !getContext().getPackageName().equals(archive.packageName)) {
          throw new Exception("That download isn't the Izuki companion app.");
        }
        PackageInfo installed = pm.getPackageInfo(getContext().getPackageName(), flags);
        long archiveCode = Build.VERSION.SDK_INT >= 28 ? archive.getLongVersionCode() : archive.versionCode;
        long installedCode = Build.VERSION.SDK_INT >= 28 ? installed.getLongVersionCode() : installed.versionCode;
        if (archiveCode <= installedCode) throw new Exception("This download is not newer than the installed app.");
        String archiveVersion = String.valueOf(archive.versionName == null ? "" : archive.versionName).trim();
        if (!expectedVersion.isEmpty() && !expectedVersion.equals(archiveVersion)) {
          throw new Exception("The release APK is version " + (archiveVersion.isEmpty() ? "unknown" : archiveVersion)
              + ", not " + expectedVersion + ". The Android build may still be uploading.");
        }
        Set<String> apkKeys = signerHashes(archive);
        Set<String> installedKeys = signerHashes(installed);
        if (apkKeys.size() == 1 && installedKeys.size() == 1 && Collections.disjoint(apkKeys, installedKeys)) {
          throw new Exception("Signature mismatch: Android won't install this over the copy on your phone. Reinstall once from the download page.");
        }
        if (!part.renameTo(apk)) throw new Exception("Couldn't finish saving the update.");
        Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apk);
        Intent install = new Intent(Intent.ACTION_VIEW);
        install.setDataAndType(uri, "application/vnd.android.package-archive");
        install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(install);
        JSObject result = new JSObject();
        result.put("started", true);
        result.put("version", archiveVersion);
        result.put("size", received);
        call.resolve(result);
      } catch (Exception e) {
        try { if (part.exists()) part.delete(); } catch (Exception ignored) { }
        call.reject("The update didn't install: " + (e.getMessage() == null ? "unknown error" : e.getMessage()));
      }
    });
  }

  /** Old installers and abandoned downloads are safe to clear after an hour. */
  private void cleanOldUpdates() {
    File[] files = getContext().getCacheDir().listFiles();
    if (files == null) return;
    long cutoff = System.currentTimeMillis() - 60L * 60 * 1000;
    for (File file : files) {
      String name = file.getName();
      if (name.startsWith("izuki-update-") && (name.endsWith(".apk") || name.endsWith(".part"))
          && file.lastModified() < cutoff) file.delete();
    }
  }

  private static HttpURLConnection open(String url) throws Exception {
    HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
    c.setInstanceFollowRedirects(false);
    c.setConnectTimeout(15000);
    c.setReadTimeout(60000);
    c.setRequestProperty("Accept", "application/octet-stream");
    c.setRequestProperty("User-Agent", "Izuki-Companion");
    return c;
  }

  private static String hex(byte[] bytes) {
    StringBuilder out = new StringBuilder(bytes.length * 2);
    for (byte b : bytes) out.append(String.format(Locale.ROOT, "%02x", b & 0xff));
    return out.toString();
  }

  private static Set<String> signerHashes(PackageInfo info) {
    Set<String> hashes = new HashSet<>();
    Signature[] signatures = null;
    try {
      if (Build.VERSION.SDK_INT >= 28 && info.signingInfo != null) {
        SigningInfo signing = info.signingInfo;
        signatures = signing.hasMultipleSigners() ? signing.getApkContentsSigners() : signing.getSigningCertificateHistory();
      } else {
        signatures = info.signatures;
      }
      if (signatures != null) for (Signature signature : signatures) {
        hashes.add(hex(MessageDigest.getInstance("SHA-256").digest(signature.toByteArray())));
      }
    } catch (Exception ignored) { }
    return hashes;
  }

  private boolean isTv() {
    UiModeManager ui = (UiModeManager) getContext().getSystemService(Context.UI_MODE_SERVICE);
    return (ui != null && ui.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION)
      || getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_LEANBACK);
  }

  @PluginMethod
  public void openAccessibilitySettings(PluginCall call) {
    Context c = getContext();
    // Straight to Izuki's own switch where Android has that page, not the top
    // of a list the person then has to search. Falls back to the list itself.
    if (Build.VERSION.SDK_INT >= 26) {
      try {
        // The constant for this action was never exposed in Settings, only its name.
        Intent details = new Intent("android.settings.ACCESSIBILITY_DETAILS_SETTINGS");
        details.putExtra(Intent.EXTRA_COMPONENT_NAME,
            new ComponentName(c, IzukiAccessibilityService.class));
        details.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        c.startActivity(details);
        call.resolve();
        return;
      } catch (Exception ignored) { }
    }
    try {
      c.startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
      call.resolve();
    } catch (Exception e) {
      call.reject("Android didn't open its accessibility screen: " + e.getMessage());
    }
  }

  /** Send the person to Izuki's own Android settings for mic/notification fixes. */
  @PluginMethod
  public void openAppSettings(PluginCall call) {
    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
        Uri.parse("package:" + getContext().getPackageName()));
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    getContext().startActivity(intent);
    call.resolve();
  }

  /**
   * A real page in the phone's own browser: the "get a key" pages, help, the
   * download page. A WebView has no tabs, so a target="_blank" link does
   * nothing there — this hands the address to Android instead.
   */
  @PluginMethod
  public void openLink(PluginCall call) {
    String url = String.valueOf(call.getString("url", "")).trim();
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
      call.reject("That isn't a web address.");
      return;
    }
    try {
      Intent go = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
      go.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(go);
      call.resolve();
    } catch (Exception e) {
      call.reject("No browser to open that page.");
    }
  }

  /**
   * One honest health check for the setup card. Each value maps to a settings
   * screen the person can open directly, instead of a paragraph of directions.
   */
  @PluginMethod
  public void repairStatus(PluginCall call) {
    call.resolve(readinessInfo());
  }

  /** Phone Readiness: the same facts as repairStatus, named for the new card. */
  @PluginMethod
  public void readiness(PluginCall call) {
    call.resolve(readinessInfo());
  }

  /**
   * What Android actually reports, capability by capability. The floating
   * orb is an accessibility overlay: it works when Android control is
   * connected, and Izuki deliberately doesn't ask for "Appear on top"
   * (it isn't in the manifest, so Samsung doesn't list Izuki there).
   * `overlay` keeps its old meaning for older pages: "the orb can show".
   */
  private JSObject readinessInfo() {
    Context c = getContext();
    JSObject result = new JSObject();
    boolean enabled = IzukiAccessibilityService.isEnabled(c);
    boolean connected = IzukiAccessibilityService.running();
    String restriction = restriction();
    result.put("control", enabled);
    result.put("running", connected);
    result.put("controlState", ControlState.control(enabled, connected, restriction));
    result.put("restricted", restriction);
    result.put("connectedAt", IzukiAccessibilityService.connectedAt());
    // Android clears an accessibility service when a sideloaded app is
    // replaced. Remember which build had it on, so "off" right after an update
    // reads as what it is (Android's doing) and not as the person's choice.
    long appCode = 0;
    try {
      PackageInfo self = c.getPackageManager().getPackageInfo(c.getPackageName(), 0);
      appCode = Build.VERSION.SDK_INT >= 28 ? self.getLongVersionCode() : self.versionCode;
    } catch (Exception ignored) { }
    int controlOnVersion = c.getSharedPreferences("izuki_native", Context.MODE_PRIVATE)
        .getInt(IzukiAccessibilityService.KEY_CONTROL_ON_VERSION, 0);
    result.put("appVersionCode", appCode);
    result.put("controlOnVersion", controlOnVersion);
    // On under some version, off now: Android replaced the app (it clears this
    // for apps installed from a file — an update *or* a reinstall with the same
    // version, which is how it silently came off on the A15). Every phone
    // action is dead until it is back on, so say so instead of "Off".
    result.put("controlOffAfterUpdate", !enabled && controlOnVersion > 0);
    result.put("overlay", connected);
    result.put("overlayMechanism", "accessibility");
    result.put("appOverlayAllowed", Settings.canDrawOverlays(c));
    result.put("mic", hasMicrophone());
    result.put("notifications", notificationsShown());
    result.put("notificationsRuntime", Build.VERSION.SDK_INT >= 33);
    PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
    result.put("battery", pm != null && pm.isIgnoringBatteryOptimizations(c.getPackageName()));
    result.put("powerSave", pm != null && pm.isPowerSaveMode());
    ActivityManager am = (ActivityManager) c.getSystemService(Context.ACTIVITY_SERVICE);
    result.put("backgroundRestricted", Build.VERSION.SDK_INT >= 28 && am != null && am.isBackgroundRestricted());
    result.put("speech", SpeechRecognizer.isRecognitionAvailable(c));
    // Why "Hey Nova" answers on the spot or falls back to "I'm here — open
    // Izuki to talk": each of the four things that turn needs, named, so the
    // Diagnostics line says which one was missing instead of just being slow.
    boolean turnControl = IzukiAccessibilityService.running();
    boolean turnPage = alive();
    boolean turnMic = c.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    boolean turnSpeech = SpeechRecognizer.isRecognitionAvailable(c);
    result.put("turnOn", turnControl && turnPage && turnMic && turnSpeech);
    result.put("turnControl", turnControl);
    result.put("turnPage", turnPage);
    result.put("turnMic", turnMic);
    result.put("turnSpeech", turnSpeech);
    result.put("wakeOn", IzukiWakeService.wanted(c));
    result.put("wakeRunning", IzukiWakeService.isRunning());
    result.put("sdk", Build.VERSION.SDK_INT);
    result.put("manufacturer", Build.MANUFACTURER);
    result.put("tv", isTv());
    result.put("checkedAt", System.currentTimeMillis());
    try {
      PackageInfo info = c.getPackageManager().getPackageInfo(c.getPackageName(), 0);
      result.put("version", info.versionName);
      result.put("versionCode", Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode);
      result.put("updateAllowed", Build.VERSION.SDK_INT < 26 || c.getPackageManager().canRequestPackageInstalls());
    } catch (Exception ignored) { }
    return result;
  }

  /**
   * Android 13+ blocks Accessibility for apps installed from a file until the
   * person allows "restricted settings" in App info. Android only partly
   * exposes this, so the answer is "restricted" (Android says so), "likely"
   * (installed from a file), or "unknown" — never a guess dressed as fact.
   */
  private String restriction() {
    int op = ControlState.OP_UNKNOWN;
    int source = ControlState.SOURCE_UNKNOWN;
    if (Build.VERSION.SDK_INT >= 33) {
      try {
        AppOpsManager ops = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        if (ops != null) op = ops.unsafeCheckOpNoThrow("android:access_restricted_settings", android.os.Process.myUid(), getContext().getPackageName());
      } catch (Exception ignored) { }
      try {
        source = getContext().getPackageManager().getInstallSourceInfo(getContext().getPackageName()).getPackageSource();
      } catch (Exception ignored) { }
    }
    return ControlState.restriction(Build.VERSION.SDK_INT, op, source);
  }

  private static volatile JSObject lastAction = null;

  /** The last phone action's outcome (no labels or typed words: those can be personal). */
  private static void remember(String op, JSONObject outcome) {
    JSObject a = new JSObject();
    a.put("op", op);
    a.put("done", outcome != null && outcome.optBoolean("done"));
    if (outcome != null && outcome.has("how")) a.put("how", outcome.optString("how"));
    if (outcome != null && outcome.has("reason")) a.put("reason", outcome.optString("reason"));
    a.put("at", System.currentTimeMillis());
    lastAction = a;
  }

  /**
   * The developer diagnostics: versions, every capability, the overlay
   * mechanism, the wake listener's state machine and recent transitions, and
   * the last action. Nothing on screen, nothing anyone said, no keys.
   */
  @PluginMethod
  public void diagnostics(PluginCall call) {
    JSObject out = new JSObject();
    out.put("readiness", readinessInfo());
    try { out.put("wake", JSObject.fromJSONObject(IzukiWakeService.status(getContext()))); } catch (Exception ignored) { }
    try { out.put("orb", JSObject.fromJSONObject(IzukiAccessibilityService.orbStatus())); } catch (Exception ignored) { }
    out.put("package", getContext().getPackageName());
    out.put("android", Build.VERSION.RELEASE);
    out.put("model", Build.MODEL);
    out.put("controlConnectedAt", IzukiAccessibilityService.connectedAt());
    out.put("controlDroppedAt", IzukiAccessibilityService.disconnectedAt());
    out.put("lastAction", lastAction);
    out.put("at", System.currentTimeMillis());
    call.resolve(out);
  }

  /** One tap: Android's own "let Izuki run in the background?" question, else the list. */
  @PluginMethod
  public void requestBatteryExemption(PluginCall call) {
    Context c = getContext();
    PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
    if (pm != null && pm.isIgnoringBatteryOptimizations(c.getPackageName())) { call.resolve(); return; }
    try {
      Intent ask = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + c.getPackageName()));
      ask.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      c.startActivity(ask);
      call.resolve();
      return;
    } catch (Exception ignored) { }
    try {
      Intent list = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      c.startActivity(list);
      call.resolve();
    } catch (Exception e) {
      call.reject("Couldn't open battery settings: " + e.getMessage());
    }
  }

  /** “Display over other apps” for this package, not the full app list. */
  @PluginMethod
  public void openOverlaySettings(PluginCall call) {
    Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:" + getContext().getPackageName()));
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    try { getContext().startActivity(intent); call.resolve(); }
    catch (Exception e) { call.reject("Couldn't open the overlay settings: " + e.getMessage()); }
  }

  /** Izuki's own notification page, where Android 13+ keeps the allow switch. */
  @PluginMethod
  public void openNotificationSettings(PluginCall call) {
    Intent intent;
    if (Build.VERSION.SDK_INT >= 26) {
      intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
          .putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
    } else {
      intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
          Uri.parse("package:" + getContext().getPackageName()));
    }
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    try { getContext().startActivity(intent); call.resolve(); }
    catch (Exception e) { call.reject("Couldn't open notification settings: " + e.getMessage()); }
  }

  /** Android's battery-optimisation list, where Izuki can be set to Unrestricted. */
  @PluginMethod
  public void openBatterySettings(PluginCall call) {
    Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    try { getContext().startActivity(intent); call.resolve(); }
    catch (Exception e) { call.reject("Couldn't open battery settings: " + e.getMessage()); }
  }

  @PluginMethod
  public void perform(PluginCall call) {
    String action = call.getString("action", "");
    if (!"lock".equals(action) && IzukiAccessibilityService.locked(getContext())) { call.reject("locked"); return; }
    if (!IzukiAccessibilityService.perform(action)) {
      remember(action, null);
      call.reject(IzukiAccessibilityService.running()
          ? "Android didn't accept that phone action."
          : "Control is off. Turn on Izuki Companion in Accessibility settings first.");
      return;
    }
    JSObject result = new JSObject();
    result.put("done", true);
    remember(action, result);
    call.resolve(result);
  }

  // ---- seeing and using the screen -------------------------------------------

  @PluginMethod
  public void screen(PluginCall call) {
    if (!IzukiAccessibilityService.running()) { call.reject("off"); return; }
    if (IzukiAccessibilityService.locked(getContext())) { call.reject("locked"); return; }
    try {
      call.resolve(JSObject.fromJSONObject(IzukiAccessibilityService.screen()));
    } catch (Exception e) {
      call.reject("couldn't read the screen: " + e.getMessage());
    }
  }

  /**
   * {op: click|focus|type|scroll|tapText|submit|tap|swipe|longpress, n, text, dir, x, y, x2, y2, ms}
   * Resolves {done, how, reason, verified?, matched?}: `done` only when
   * Android performed it (an accessibility action that returned true, or a
   * gesture Android reported completed), and `reason` when it didn't.
   */
  @PluginMethod
  public void act(PluginCall call) {
    if (!IzukiAccessibilityService.running()) { call.reject("off"); return; }
    if (IzukiAccessibilityService.locked(getContext())) { call.reject("locked"); return; }
    String op = call.getString("op", "");
    int n = call.getInt("n", 0);
    float x = coord(call, "x");
    float y = coord(call, "y");
    float x2 = coord(call, "x2");
    float y2 = coord(call, "y2");
    int ms = call.getInt("ms", 300);
    java.util.function.Consumer<JSONObject> answer = (outcome) -> {
      remember(op, outcome);
      try { call.resolve(JSObject.fromJSONObject(outcome)); }
      catch (Exception e) { JSObject r = new JSObject(); r.put("done", outcome.optBoolean("done")); call.resolve(r); }
    };
    switch (op) {
      case "click": IzukiAccessibilityService.click(n, Boolean.TRUE.equals(call.getBoolean("risky", false)), call.getString("expect", ""), answer); break;
      case "tapText": IzukiAccessibilityService.tapText(call.getString("text", ""), answer); break;
      case "submit": IzukiAccessibilityService.submit(answer); break;
      case "tap": IzukiAccessibilityService.gesture("tap", x, y, 0, 0, 60, answer); break;
      case "swipe": IzukiAccessibilityService.gesture("swipe", x, y, x2, y2, ms, answer); break;
      case "longpress": IzukiAccessibilityService.gesture("longpress", x, y, 0, 0, ms, answer); break;
      case "type": answer.accept(IzukiAccessibilityService.type(n, call.getString("text", ""))); break;
      case "scroll": answer.accept(IzukiAccessibilityService.scroll(call.getString("dir", "down"))); break;
      case "focus": {
        JSObject r = new JSObject();
        r.put("done", IzukiAccessibilityService.focus(n));
        answer.accept(r);
        break;
      }
      default: {
        JSObject r = new JSObject();
        r.put("done", IzukiAccessibilityService.perform(op));
        answer.accept(r);
      }
    }
  }

  /** A real touch gesture at screen coordinates (tap, swipe, long-press), confirmed by Android. */
  @PluginMethod
  public void gesture(PluginCall call) {
    if (!IzukiAccessibilityService.running()) { call.reject("off"); return; }
    if (IzukiAccessibilityService.locked(getContext())) { call.reject("locked"); return; }
    String op = call.getString("op", "tap");
    IzukiAccessibilityService.gesture(op,
      coord(call, "x"), coord(call, "y"),
      coord(call, "x2"), coord(call, "y2"),
      call.getInt("ms", 300),
      (outcome) -> {
        remember(op, outcome);
        try { call.resolve(JSObject.fromJSONObject(outcome)); }
        catch (Exception e) { JSObject r = new JSObject(); r.put("done", outcome.optBoolean("done")); call.resolve(r); }
      });
  }

  private static float coord(PluginCall call, String key) {
    Double v = call.getDouble(key);
    return v == null ? 0f : v.floatValue();
  }

  /**
   * {state: listen|think|talk|rest|idle, text, lease}. Listen, think and talk
   * are leases (default 20 s) the page renews while they're true; without a
   * renewal the orb falls back to resting instead of claiming "Listening…".
   */
  @PluginMethod
  public void orb(PluginCall call) {
    String state = call.getString("state", "idle");
    Integer lease = call.getInt("lease");
    long ms = lease != null ? Math.max(0, Math.min(120_000, lease)) : ("rest".equals(state) ? 0 : 20_000);
    IzukiAccessibilityService.orb(state, call.getString("text", ""), ms);
    JSObject result = new JSObject();
    result.put("available", IzukiAccessibilityService.running());
    call.resolve(result);
  }

  @PluginMethod
  public void orbStatus(PluginCall call) {
    try { call.resolve(JSObject.fromJSONObject(IzukiAccessibilityService.orbStatus())); }
    catch (Exception e) { call.reject("orb status unavailable"); }
  }

  // ---- apps -------------------------------------------------------------------

  private List<ResolveInfo> launchable() {
    PackageManager pm = getContext().getPackageManager();
    List<ResolveInfo> all = new ArrayList<>();
    Intent tv = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER);
    Intent phone = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER);
    all.addAll(pm.queryIntentActivities(tv, 0));
    for (ResolveInfo r : pm.queryIntentActivities(phone, 0)) {
      boolean seen = false;
      for (ResolveInfo a : all) if (a.activityInfo.packageName.equals(r.activityInfo.packageName)) { seen = true; break; }
      if (!seen) all.add(r);
    }
    return all;
  }

  @PluginMethod
  public void apps(PluginCall call) {
    PackageManager pm = getContext().getPackageManager();
    JSArray list = new JSArray();
    for (ResolveInfo r : launchable()) {
      JSObject a = new JSObject();
      a.put("name", r.loadLabel(pm).toString());
      a.put("id", r.activityInfo.packageName);
      list.put(a);
    }
    JSObject result = new JSObject();
    result.put("apps", list);
    call.resolve(result);
  }

  /** Open an app by name ("netflix", "youtube") or package id. */
  @PluginMethod
  public void launch(PluginCall call) {
    if (IzukiAccessibilityService.locked(getContext())) { call.reject("locked"); return; }
    String wanted = call.getString("name", "").toLowerCase(Locale.ROOT).trim();
    PackageManager pm = getContext().getPackageManager();
    ResolveInfo best = null;
    int bestScore = 0;
    for (ResolveInfo r : launchable()) {
      String label = r.loadLabel(pm).toString().toLowerCase(Locale.ROOT);
      String pkg = r.activityInfo.packageName.toLowerCase(Locale.ROOT);
      int score = label.equals(wanted) || pkg.equals(wanted) ? 3 : label.startsWith(wanted) ? 2 : (label.contains(wanted) || pkg.contains(wanted.replace(" ", ""))) ? 1 : 0;
      if (score > bestScore) { best = r; bestScore = score; }
    }
    if (best == null || wanted.isEmpty()) { call.reject("I couldn't find " + wanted + " on this " + (isTv() ? "TV" : "phone") + "."); return; }
    String pkg = best.activityInfo.packageName;
    Intent open = pm.getLeanbackLaunchIntentForPackage(pkg);
    if (open == null) open = pm.getLaunchIntentForPackage(pkg);
    if (open == null) { call.reject("That app can't be opened directly."); return; }
    open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    try { getContext().startActivity(open); }
    catch (Exception e) { call.reject("Android didn't open " + best.loadLabel(pm) + "."); return; }
    // Only after a real launch: leave the glass orb above Photos, Maps or the
    // app that just opened, when the person kept that setting on. It rests:
    // nothing is listening until it's tapped.
    if (!Boolean.FALSE.equals(call.getBoolean("orb", true))) {
      IzukiAccessibilityService.orbFor("launch", "rest", "");
    }
    JSObject result = new JSObject();
    result.put("name", best.loadLabel(pm).toString());
    // The package, so the caller can confirm this app really came to the front.
    result.put("id", pkg);
    call.resolve(result);
  }

  /** Start Google Maps turn-by-turn to a place, without guessing at its UI. */
  @PluginMethod
  public void navigate(PluginCall call) {
    if (IzukiAccessibilityService.locked(getContext())) { call.reject("locked"); return; }
    String to = call.getString("to", "").trim();
    if (to.isEmpty()) { call.reject("Where should I go?"); return; }
    boolean navigating = false;
    try {
      Intent go = new Intent(Intent.ACTION_VIEW,
          Uri.parse("google.navigation:q=" + Uri.encode(to) + "&mode=d"));
      go.setPackage("com.google.android.apps.maps");
      go.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(go);
      navigating = true;
    } catch (Exception ignored) { }
    if (!navigating) {
      try {
        // `geo:` may open a place search rather than turn-by-turn. Keep that
        // separate from a real navigation so the page can offer web directions
        // instead of claiming Maps has the turns.
        Intent geo = new Intent(Intent.ACTION_VIEW,
            Uri.parse("geo:0,0?q=" + Uri.encode(to)));
        geo.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(geo);
      } catch (Exception ignored) { }
    }
    if (navigating && !Boolean.FALSE.equals(call.getBoolean("orb", true))) {
      // Keep the glass orb above Maps, ready for "when I get there, remind me…".
      IzukiAccessibilityService.orbFor("maps", "rest", "Maps is driving — tap to talk");
    }
    JSObject result = new JSObject();
    result.put("to", to);
    result.put("navigation", navigating);
    call.resolve(result);
  }

  /** The phone's stream levels, for the sound panel (not private content). */
  @PluginMethod
  public void audio(PluginCall call) {
    AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
    JSObject result = new JSObject();
    if (am == null) { call.reject("Sound control isn't available on this phone."); return; }
    int[][] streams = {
        {AudioManager.STREAM_MUSIC, 0}, {AudioManager.STREAM_RING, 1},
        {AudioManager.STREAM_ALARM, 2}, {AudioManager.STREAM_NOTIFICATION, 3},
    };
    String[] names = {"media", "ring", "alarm", "notification"};
    for (int i = 0; i < streams.length; i++) {
      int stream = streams[i][0];
      result.put(names[i], am.getStreamVolume(stream));
      result.put(names[i] + "Max", am.getStreamMaxVolume(stream));
    }
    result.put("musicMuted", am.isStreamMute(AudioManager.STREAM_MUSIC));
    call.resolve(result);
  }

  /** Set one stream, clamped to what the phone will actually accept. */
  @PluginMethod
  public void setVolume(PluginCall call) {
    String name = call.getString("stream", "media");
    int stream;
    switch (name) {
      case "ring": stream = AudioManager.STREAM_RING; break;
      case "alarm": stream = AudioManager.STREAM_ALARM; break;
      case "notification": stream = AudioManager.STREAM_NOTIFICATION; break;
      default: stream = AudioManager.STREAM_MUSIC; break;
    }
    AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
    if (am == null) { call.reject("Sound control isn't available on this phone."); return; }
    int max = am.getStreamMaxVolume(stream);
    int level = Math.max(0, Math.min(max, call.getInt("level", 0)));
    try {
      am.setStreamVolume(stream, level, AudioManager.FLAG_SHOW_UI);
    } catch (SecurityException e) {
      // Do Not Disturb or a device policy can forbid changing this stream.
      call.reject("Android won't let Izuki change this volume right now (Do Not Disturb or a device policy).");
      return;
    }
    JSObject result = new JSObject();
    result.put("stream", name);
    result.put("level", am.getStreamVolume(stream));
    result.put("max", max);
    call.resolve(result);
  }

  /** Duck other media with audio focus while Izuki's voice is speaking. */
  @PluginMethod
  public void audioFocus(PluginCall call) {
    AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
    if (am == null) { call.reject("Sound control isn't available on this phone."); return; }
    boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
    if (focusListener == null) focusListener = change -> { };
    int result;
    try {
      result = on
          ? am.requestAudioFocus(focusListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
          : am.abandonAudioFocus(focusListener);
    } catch (SecurityException e) {
      call.reject("Android won't share audio focus right now.");
      return;
    }
    JSObject out = new JSObject();
    out.put("focused", result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED);
    call.resolve(out);
  }

  // ---- play, pause, volume ------------------------------------------------------

  @PluginMethod
  public void media(PluginCall call) {
    String key = call.getString("key", "playpause");
    int code;
    switch (key) {
      case "play": code = KeyEvent.KEYCODE_MEDIA_PLAY; break;
      case "pause": code = KeyEvent.KEYCODE_MEDIA_PAUSE; break;
      case "next": code = KeyEvent.KEYCODE_MEDIA_NEXT; break;
      case "previous": code = KeyEvent.KEYCODE_MEDIA_PREVIOUS; break;
      case "forward": code = KeyEvent.KEYCODE_MEDIA_FAST_FORWARD; break;
      case "rewind": code = KeyEvent.KEYCODE_MEDIA_REWIND; break;
      case "stop": code = KeyEvent.KEYCODE_MEDIA_STOP; break;
      default: code = KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE;
    }
    AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
    long now = SystemClock.uptimeMillis();
    am.dispatchMediaKeyEvent(new KeyEvent(now, now, KeyEvent.ACTION_DOWN, code, 0));
    am.dispatchMediaKeyEvent(new KeyEvent(now, now, KeyEvent.ACTION_UP, code, 0));
    call.resolve();
  }

  @PluginMethod
  public void volume(PluginCall call) {
    String dir = call.getString("dir", "up");
    int steps = Math.max(1, Math.min(15, call.getInt("steps", 3)));
    AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
    if ("mute".equals(dir) || "unmute".equals(dir)) {
      am.adjustStreamVolume(AudioManager.STREAM_MUSIC, "mute".equals(dir) ? AudioManager.ADJUST_MUTE : AudioManager.ADJUST_UNMUTE, AudioManager.FLAG_SHOW_UI);
    } else {
      for (int i = 0; i < steps; i++) {
        am.adjustStreamVolume(AudioManager.STREAM_MUSIC, "down".equals(dir) ? AudioManager.ADJUST_LOWER : AudioManager.ADJUST_RAISE, i == steps - 1 ? AudioManager.FLAG_SHOW_UI : 0);
      }
    }
    call.resolve();
  }

  // ---- finding Izuki on the PC (home Wi-Fi) ------------------------------------------

  /** Ask every address on this network whether Izuki is there (~3 s). */
  @PluginMethod
  public void findPcs(PluginCall call) {
    work.execute(() -> {
      JSArray found = new JSArray();
      String base = subnet();
      if (base != null) {
        ExecutorService pool = Executors.newFixedThreadPool(48);
        List<JSObject> hits = Collections.synchronizedList(new ArrayList<>());
        for (int i = 1; i < 255; i++) {
          final String ip = base + i;
          pool.execute(() -> {
            try {
              String body = get("http://" + ip + ":47616/izuki/hello", 700);
              JSONObject v = new JSONObject(body);
              if ("izuki".equals(v.optString("service"))) {
                JSObject hit = new JSObject();
                hit.put("ip", ip);
                hit.put("name", v.optString("name", ip));
                hit.put("version", v.optString("version", ""));
                hits.add(hit);
              }
            } catch (Exception ignored) { }
          });
        }
        pool.shutdown();
        try { pool.awaitTermination(6, TimeUnit.SECONDS); } catch (InterruptedException ignored) { }
        for (JSObject h : hits) found.put(h);
      }
      JSObject result = new JSObject();
      result.put("pcs", found);
      result.put("network", base == null ? "" : base + "x");
      call.resolve(result);
    });
  }

  /** A request to the PC on the home network (the web page itself may not reach it). */
  @PluginMethod
  public void http(PluginCall call) {
    String url = call.getString("url", "");
    if (!url.matches("^http://(10|192\\.168|172\\.(1[6-9]|2\\d|3[01]))\\.[0-9.]+:(47616|8060|8001|3000)/.*")) {
      call.reject("only the home network");
      return;
    }
    String method = call.getString("method", "GET");
    String body = call.getString("body", null);
    String auth = call.getString("auth", null);
    int timeout = call.getInt("timeout", 25000);
    work.execute(() -> {
      try {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(3000);
        c.setReadTimeout(timeout);
        c.setRequestMethod(method);
        if (auth != null) c.setRequestProperty("Authorization", "Bearer " + auth);
        if (body != null) {
          c.setDoOutput(true);
          c.setRequestProperty("Content-Type", "application/json");
          try (OutputStream o = c.getOutputStream()) { o.write(body.getBytes(StandardCharsets.UTF_8)); }
        }
        int status = c.getResponseCode();
        InputStream in = status < 400 ? c.getInputStream() : c.getErrorStream();
        JSObject result = new JSObject();
        result.put("status", status);
        result.put("body", in == null ? "" : read(in));
        call.resolve(result);
      } catch (Exception e) {
        call.reject("couldn't reach it: " + e.getMessage());
      }
    });
  }

  private static String get(String url, int timeoutMs) throws Exception {
    HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
    c.setConnectTimeout(timeoutMs);
    c.setReadTimeout(timeoutMs);
    try (InputStream in = c.getInputStream()) { return read(in); }
  }

  private static String read(InputStream in) throws Exception {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    byte[] buf = new byte[8192];
    int n;
    while ((n = in.read(buf)) > 0 && out.size() < 4_000_000) out.write(buf, 0, n);
    return out.toString("UTF-8");
  }

  /** "192.168.1." for this device's home network. */
  private static String subnet() {
    try {
      Enumeration<NetworkInterface> all = NetworkInterface.getNetworkInterfaces();
      while (all.hasMoreElements()) {
        NetworkInterface ni = all.nextElement();
        if (!ni.isUp() || ni.isLoopback()) continue;
        Enumeration<InetAddress> addrs = ni.getInetAddresses();
        while (addrs.hasMoreElements()) {
          InetAddress a = addrs.nextElement();
          if (a instanceof Inet4Address && a.isSiteLocalAddress()) {
            String ip = a.getHostAddress();
            return ip.substring(0, ip.lastIndexOf('.') + 1);
          }
        }
      }
    } catch (Exception ignored) { }
    return null;
  }
}
