package com.novaizuki.mobile;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.graphics.drawable.Icon;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import java.util.ArrayList;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Optional "Hey Nova" listening, only while the person has switched it on.
 *
 * Android does not let an ordinary app listen for a custom hotword in the
 * background, so this uses a foreground service with Android's own speech
 * recognizer and a persistent notification. It is not a secret listener:
 * Android shows the notification the whole time, and turning the switch off
 * stops it. A wake wakes the screen and posts "unlock to talk", but it never
 * dismisses the lock screen or runs a phone action while locked.
 */
public class IzukiWakeService extends Service implements RecognitionListener {
  public static final String ACTION_START = "com.novaizuki.mobile.WAKE_START";
  public static final String ACTION_STOP = "com.novaizuki.mobile.WAKE_STOP";
  public static final String ACTION_PAUSE = "com.novaizuki.mobile.WAKE_PAUSE";
  public static final String ACTION_RESUME = "com.novaizuki.mobile.WAKE_RESUME";
  private static final String CHANNEL = "izuki_wake";
  private static final int NOTIFY_ID = 7311;
  private static final String PREFS = "izuki_native";
  static final String KEY_WAKE = "wake_on";
  private static final Pattern WAKE = Pattern.compile(
      "\\b(?:hey|hi|ok|okay)\\s+(?:nova|izuki)\\b", Pattern.CASE_INSENSITIVE);

  private static volatile boolean running = false;

  private final Handler handler = new Handler(Looper.getMainLooper());
  private SpeechRecognizer recognizer;
  private boolean enabled;
  private boolean listening;
  private long pausedUntil;
  private long lastWake;
  private final Runnable restart = () -> { if (enabled && SystemClock.elapsedRealtime() >= pausedUntil) startListening(); };

  public static boolean isRunning() { return running; }

  static void start(Context context) {
    Intent intent = new Intent(context, IzukiWakeService.class).setAction(ACTION_START);
    if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(intent);
    else context.startService(intent);
  }

  static void stop(Context context) {
    context.stopService(new Intent(context, IzukiWakeService.class).setAction(ACTION_STOP));
  }

  /** Stop competing with a live call's microphone, without forgetting the switch. */
  static void pause(Context context, long ms) {
    Intent intent = new Intent(context, IzukiWakeService.class)
        .setAction(ACTION_PAUSE).putExtra("pause_ms", Math.max(30_000L, Math.min(ms, 3_600_000L)));
    if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(intent);
    else context.startService(intent);
  }

  static void resume(Context context) {
    Intent intent = new Intent(context, IzukiWakeService.class).setAction(ACTION_RESUME);
    if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(intent);
    else context.startService(intent);
  }

  @Override public void onCreate() {
    super.onCreate();
    running = true;
    createChannel();
  }

  @Override public int onStartCommand(Intent intent, int flags, int startId) {
    if (intent != null && ACTION_STOP.equals(intent.getAction())) {
      setEnabled(false);
      stopSelf();
      return START_NOT_STICKY;
    }
    boolean paused = intent != null && ACTION_PAUSE.equals(intent.getAction());
    boolean resumed = intent != null && ACTION_RESUME.equals(intent.getAction());
    try {
      startInForeground(paused ? "Paused while Izuki is on a call." : "Listening for “Hey Nova”…");
    } catch (Exception e) {
      // Android 14+ can refuse a microphone foreground service when the app /
      // permission is in a state that does not allow it. Fail closed, not loud.
      setEnabled(false);
      stopSelf();
      return START_NOT_STICKY;
    }
    enabled = true;
    if (paused) {
      long ms = intent.getLongExtra("pause_ms", 600_000L);
      pausedUntil = SystemClock.elapsedRealtime() + ms;
      stopListening();
      updateNotification("Paused while Izuki is on a call.");
      return START_STICKY;
    }
    if (resumed) pausedUntil = 0;
    else setEnabled(true);
    if (!SpeechRecognizer.isRecognitionAvailable(this)) {
      setEnabled(false);
      updateNotification("Speech recognition isn't available on this phone.");
      stopSelf();
      return START_NOT_STICKY;
    }
    startListening();
    return START_STICKY;
  }

  private void setEnabled(boolean on) {
    getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean(KEY_WAKE, on).apply();
  }

  private void startInForeground(String text) {
    Notification notification = notification(text);
    if (Build.VERSION.SDK_INT >= 29) {
      startForeground(NOTIFY_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
    } else {
      startForeground(NOTIFY_ID, notification);
    }
  }

  private void createChannel() {
    if (Build.VERSION.SDK_INT < 26) return;
    NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    if (nm == null) return;
    NotificationChannel channel = new NotificationChannel(CHANNEL, "Izuki wake word", NotificationManager.IMPORTANCE_LOW);
    channel.setDescription("Shows while Izuki is listening for “Hey Nova”.");
    channel.setShowBadge(false);
    nm.createNotificationChannel(channel);
  }

  private Notification notification(String text) {
    Intent open = new Intent(this, MainActivity.class)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        .putExtra("izuki_wake", "Hey Nova");
    PendingIntent content = PendingIntent.getActivity(this, 0, open,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Intent stop = new Intent(this, IzukiWakeService.class).setAction(ACTION_STOP);
    PendingIntent stopIntent = PendingIntent.getService(this, 1, stop,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Notification.Builder b = Build.VERSION.SDK_INT >= 26
        ? new Notification.Builder(this, CHANNEL)
        : new Notification.Builder(this);
    return b.setContentTitle("Izuki")
        .setContentText(text)
        .setSmallIcon(android.R.drawable.ic_btn_speak_now)
        .setOngoing(true)
        .setOnlyAlertOnce(true)
        .setContentIntent(content)
        .addAction(new Notification.Action.Builder(Icon.createWithResource(this, android.R.drawable.ic_btn_speak_now), "Stop listening", stopIntent).build())
        .build();
  }

  private void updateNotification(String text) {
    NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    if (nm != null) nm.notify(NOTIFY_ID, notification(text));
  }

  private void startListening() {
    if (!enabled || listening || SystemClock.elapsedRealtime() < pausedUntil) return;
    try {
      if (recognizer == null) {
        recognizer = SpeechRecognizer.createSpeechRecognizer(this);
        recognizer.setRecognitionListener(this);
      }
      Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
          .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
          .putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toLanguageTag())
          .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
          .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
          .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1200)
          .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 800);
      listening = true;
      recognizer.startListening(intent);
      updateNotification("Listening for “Hey Nova”…");
    } catch (Exception e) {
      listening = false;
      updateNotification("Couldn't start the microphone. Check Izuki's microphone permission.");
      scheduleRestart(2500);
    }
  }

  private void stopListening() {
    listening = false;
    handler.removeCallbacks(restart);
    if (recognizer != null) {
      try { recognizer.cancel(); } catch (Exception ignored) { }
    }
  }

  private void scheduleRestart(int delay) {
    listening = false;
    handler.removeCallbacks(restart);
    handler.postDelayed(restart, delay);
  }

  private void check(Bundle results) {
    if (results == null) return;
    ArrayList<String> heard = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
    if (heard == null) return;
    for (String text : heard) {
      if (text == null) continue;
      if (WAKE.matcher(text).find()) {
        onWake(text);
        return;
      }
    }
  }

  private void onWake(String phrase) {
    long now = SystemClock.elapsedRealtime();
    if (now - lastWake < 6000) return;
    lastWake = now;
    pausedUntil = now + 12000;
    stopListening();
    wakeScreen();
    vibrate();
    // Show the glass orb over the lock screen / current app immediately, before
    // the page finishes waking. Tapping it opens Izuki ready to listen.
    IzukiAccessibilityService.orb("listen", "Hey Nova — tap to talk");
    IzukiControlPlugin.setWakePhrase(phrase);
    IzukiControlPlugin.notifyWake(phrase);
    updateNotification("I'm here — unlock your phone to talk.");
    Intent open = new Intent(this, MainActivity.class)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        .putExtra("izuki_wake", phrase);
    try { startActivity(open); } catch (Exception ignored) { }
    handler.postDelayed(() -> {
      if (!enabled) return;
      updateNotification("Listening for “Hey Nova”…");
      startListening();
    }, 12000);
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

  @Override public void onReadyForSpeech(Bundle params) { listening = true; }
  @Override public void onBeginningOfSpeech() { }
  @Override public void onRmsChanged(float rmsdB) { }
  @Override public void onBufferReceived(byte[] buffer) { }
  @Override public void onEndOfSpeech() { listening = false; }
  @Override public void onError(int error) {
    listening = false;
    if (!enabled) return;
    if (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) {
      updateNotification("Microphone permission is off for Izuki. Turn it on in Android settings.");
      return;
    }
    int delay = error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY ? 1200 : 500;
    scheduleRestart(delay);
  }
  @Override public void onResults(Bundle results) { check(results); if (enabled) scheduleRestart(250); }
  @Override public void onPartialResults(Bundle partialResults) { check(partialResults); }
  @Override public void onEvent(int eventType, Bundle params) { }

  @Override public void onDestroy() {
    enabled = false;
    running = false;
    IzukiAccessibilityService.orb("idle", "");
    stopListening();
    if (recognizer != null) {
      try { recognizer.destroy(); } catch (Exception ignored) { }
      recognizer = null;
    }
    try { stopForeground(true); } catch (Exception ignored) { }
    super.onDestroy();
  }

  @Override public IBinder onBind(Intent intent) { return null; }
}
