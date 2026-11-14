package com.novaizuki.mobile;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Boot only restarts the listener if the switch was explicitly left on. */
public class IzukiWakeBootReceiver extends BroadcastReceiver {
  @Override public void onReceive(Context context, Intent intent) {
    if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
    if (!context.getSharedPreferences("izuki_native", Context.MODE_PRIVATE)
        .getBoolean(IzukiWakeService.KEY_WAKE, false)) return;
    try { IzukiWakeService.start(context); } catch (Exception ignored) { }
  }
}
