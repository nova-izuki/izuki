package com.novaizuki.mobile;

import android.app.KeyguardManager;
import android.app.UiModeManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
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
import java.util.ArrayList;
import java.util.Collections;
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
  private AudioManager.OnAudioFocusChangeListener focusListener;

  @Override public void load() { instance = this; }

  /** Remember a wake phrase delivered before the web page was ready. */
  static void setWakePhrase(String phrase) {
    pendingWake = phrase == null ? "" : phrase;
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
      call.resolve(result);
    }, call::reject);
  }

  /** Turn the opt-in “Hey Nova” listener on or off. */
  @PluginMethod
  public void wake(PluginCall call) {
    boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
    if (on && !SpeechRecognizer.isRecognitionAvailable(getContext())) {
      call.reject("Speech recognition isn't available on this phone.");
      return;
    }
    getContext().getSharedPreferences("izuki_native", Context.MODE_PRIVATE).edit()
        .putBoolean(IzukiWakeService.KEY_WAKE, on).apply();
    try {
      if (on) IzukiWakeService.start(getContext());
      else IzukiWakeService.stop(getContext());
    } catch (Exception e) {
      getContext().getSharedPreferences("izuki_native", Context.MODE_PRIVATE).edit()
          .putBoolean(IzukiWakeService.KEY_WAKE, false).apply();
      call.reject("Couldn't start the wake listener: " + e.getMessage());
      return;
    }
    JSObject result = new JSObject();
    result.put("on", on);
    result.put("running", IzukiWakeService.isRunning());
    result.put("available", SpeechRecognizer.isRecognitionAvailable(getContext()));
    call.resolve(result);
  }

  @PluginMethod
  public void wakeStatus(PluginCall call) {
    JSObject result = new JSObject();
    result.put("on", getContext().getSharedPreferences("izuki_native", Context.MODE_PRIVATE)
        .getBoolean(IzukiWakeService.KEY_WAKE, false));
    result.put("running", IzukiWakeService.isRunning());
    result.put("available", SpeechRecognizer.isRecognitionAvailable(getContext()));
    call.resolve(result);
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
      android.content.pm.PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
      result.put("version", info.versionName);
    } catch (Exception ignored) { }
    call.resolve(result);
  }

  // ---- updating itself ---------------------------------------------------------

  /** Download the newer app and hand it to Android's installer (one press to update). */
  @PluginMethod
  public void installUpdate(PluginCall call) {
    String url = call.getString("url", "");
    if (!url.startsWith("https://github.com/nova-izuki/izuki/releases/")) { call.reject("not an Izuki update"); return; }
    if (Build.VERSION.SDK_INT >= 26 && !getContext().getPackageManager().canRequestPackageInstalls()) {
      // Android asks once: "allow Izuki to install updates".
      Intent allow = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
      allow.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(allow);
      call.reject("allow");
      return;
    }
    work.execute(() -> {
      try {
        File apk = new File(getContext().getCacheDir(), "izuki-update.apk");
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setInstanceFollowRedirects(true);
        c.setConnectTimeout(15000);
        c.setReadTimeout(60000);
        // GitHub hands the file over from another address: follow it.
        for (int hop = 0; hop < 5; hop++) {
          int code = c.getResponseCode();
          if (code < 300 || code >= 400) break;
          String next = c.getHeaderField("Location");
          c.disconnect();
          c = (HttpURLConnection) new URL(next).openConnection();
          c.setConnectTimeout(15000);
          c.setReadTimeout(60000);
        }
        try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(apk)) {
          byte[] buf = new byte[65536];
          int n;
          while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        }
        Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apk);
        Intent install = new Intent(Intent.ACTION_VIEW);
        install.setDataAndType(uri, "application/vnd.android.package-archive");
        install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(install);
        call.resolve();
      } catch (Exception e) {
        call.reject("The update didn't download: " + e.getMessage());
      }
    });
  }

  private boolean isTv() {
    UiModeManager ui = (UiModeManager) getContext().getSystemService(Context.UI_MODE_SERVICE);
    return (ui != null && ui.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION)
      || getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_LEANBACK);
  }

  @PluginMethod
  public void openAccessibilitySettings(PluginCall call) {
    getActivity().startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
    call.resolve();
  }

  @PluginMethod
  public void perform(PluginCall call) {
    String action = call.getString("action", "");
    if (!"lock".equals(action) && IzukiAccessibilityService.locked(getContext())) { call.reject("locked"); return; }
    if (!IzukiAccessibilityService.perform(action)) {
      call.reject("Control is off. Turn on Izuki Companion in Accessibility settings first.");
      return;
    }
    JSObject result = new JSObject();
    result.put("done", true);
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

  /** {op: click|focus|type|scroll|tapText|submit|tap|swipe|longpress, n, text, dir, x, y, x2, y2, ms} */
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
    boolean done;
    switch (op) {
      case "click": done = IzukiAccessibilityService.click(n); break;
      case "focus": done = IzukiAccessibilityService.focus(n); break;
      case "type": done = IzukiAccessibilityService.type(n, call.getString("text", "")); break;
      case "scroll": done = IzukiAccessibilityService.scroll(call.getString("dir", "down")); break;
      case "tapText": done = IzukiAccessibilityService.tapText(call.getString("text", "")); break;
      case "submit": done = IzukiAccessibilityService.submit(); break;
      case "tap": done = IzukiAccessibilityService.gesture("tap", x, y, 0, 0, 60); break;
      case "swipe": done = IzukiAccessibilityService.gesture("swipe", x, y, x2, y2, ms); break;
      case "longpress": done = IzukiAccessibilityService.gesture("longpress", x, y, 0, 0, ms); break;
      default: done = IzukiAccessibilityService.perform(op);
    }
    JSObject result = new JSObject();
    result.put("done", done);
    call.resolve(result);
  }

  /** A real touch gesture at screen coordinates (tap, swipe, long-press). */
  @PluginMethod
  public void gesture(PluginCall call) {
    if (!IzukiAccessibilityService.running()) { call.reject("off"); return; }
    if (IzukiAccessibilityService.locked(getContext())) { call.reject("locked"); return; }
    boolean done = IzukiAccessibilityService.gesture(
      call.getString("op", "tap"),
      coord(call, "x"), coord(call, "y"),
      coord(call, "x2"), coord(call, "y2"),
      call.getInt("ms", 300));
    JSObject result = new JSObject();
    result.put("done", done);
    call.resolve(result);
  }

  private static float coord(PluginCall call, String key) {
    Double v = call.getDouble(key);
    return v == null ? 0f : v.floatValue();
  }

  @PluginMethod
  public void orb(PluginCall call) {
    IzukiAccessibilityService.orb(call.getString("state", "idle"), call.getString("text", ""));
    call.resolve();
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
    if (best == null || wanted.isEmpty()) { call.reject("I couldn't find " + wanted + " on this TV."); return; }
    String pkg = best.activityInfo.packageName;
    Intent open = pm.getLeanbackLaunchIntentForPackage(pkg);
    if (open == null) open = pm.getLaunchIntentForPackage(pkg);
    if (open == null) { call.reject("That app can't be opened directly."); return; }
    open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    getContext().startActivity(open);
    JSObject result = new JSObject();
    result.put("name", best.loadLabel(pm).toString());
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
