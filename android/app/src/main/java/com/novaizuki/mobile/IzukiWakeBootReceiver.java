package com.novaizuki.mobile;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

/**
 * Boot only brings the listener back if the switch was explicitly left on.
 *
 * From Android 11 a microphone service started in the background can't
 * hear (and Android 14+ refuses to start it): trying used to fail silently
 * and looked like the switch was on while nothing listened. There a quiet
 * notification says so instead, and opening Izuki starts it again.
 */
public class IzukiWakeBootReceiver extends BroadcastReceiver {
  @Override public void onReceive(Context context, Intent intent) {
    if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
    if (!IzukiWakeService.wanted(context)) return;
    // From Android 11, a foreground service started in the background gets
    // no microphone, even when it starts: only older phones restart here.
    if (Build.VERSION.SDK_INT < 30) {
      try { IzukiWakeService.start(context); return; } catch (Exception ignored) { }
    }
    tellToOpen(context);
  }

  private static void tellToOpen(Context context) {
    NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    if (nm == null) return;
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationChannel channel = new NotificationChannel("izuki_wake", "Izuki wake word", NotificationManager.IMPORTANCE_LOW);
      channel.setSound(null, null);
      nm.createNotificationChannel(channel);
    }
    Intent open = new Intent(context, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    PendingIntent content = PendingIntent.getActivity(context, 3, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(context, "izuki_wake") : new Notification.Builder(context);
    b.setContentTitle("Izuki")
        .setContentText("“Hey Nova” is paused after the restart. Open Izuki once to turn it back on.")
        .setSmallIcon(android.R.drawable.ic_btn_speak_now)
        .setContentIntent(content)
        .setAutoCancel(true);
    try { nm.notify(7312, b.build()); } catch (Exception ignored) { }
  }
}
