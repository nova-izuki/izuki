package com.novaizuki.mobile;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * The wake notification's content intent. It is not exported; the PendingIntent
 * is created by this app, so no other app can use it to inject a phrase. The
 * receiver mints the same one-use hand-off token as the tile and wake service.
 */
public class IzukiWakeLaunchReceiver extends BroadcastReceiver {
  @Override public void onReceive(Context context, Intent intent) {
    String phrase = intent == null ? null : intent.getStringExtra("phrase");
    Intent open = new Intent(context, MainActivity.class)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        .putExtra("izuki_wake_token", IzukiControlPlugin.beginWake(phrase));
    try { context.startActivity(open); } catch (Exception ignored) { }
  }
}
