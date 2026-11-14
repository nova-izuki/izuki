package com.novaizuki.mobile;

import com.getcapacitor.BridgeActivity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
  private final BroadcastReceiver unlockReceiver = new BroadcastReceiver() {
    @Override public void onReceive(Context context, Intent intent) {
      if (intent != null && Intent.ACTION_USER_PRESENT.equals(intent.getAction())) {
        IzukiControlPlugin.notifyUnlock();
      }
    }
  };

  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(IzukiControlPlugin.class);
    super.onCreate(savedInstanceState);
    handleWake(getIntent());
    try {
      IntentFilter filter = new IntentFilter(Intent.ACTION_USER_PRESENT);
      if (Build.VERSION.SDK_INT >= 33) registerReceiver(unlockReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
      else registerReceiver(unlockReceiver, filter);
    } catch (Exception ignored) { }
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    handleWake(intent);
  }

  @Override
  public void onDestroy() {
    try { unregisterReceiver(unlockReceiver); } catch (Exception ignored) { }
    super.onDestroy();
  }

  /** The wake listener posts a phrase; the web page takes it when it is ready. */
  private void handleWake(Intent intent) {
    if (intent == null) return;
    String phrase = intent.getStringExtra("izuki_wake");
    if (phrase == null) return;
    IzukiControlPlugin.setWakePhrase(phrase);
    // A warm WebView might not get a visibility change when the Quick Settings
    // tile brings Izuki forward; tell the open page too. The page's duplicate
    // guard folds this into the pending phrase when both arrive.
    IzukiControlPlugin.notifyWake(phrase);
    intent.removeExtra("izuki_wake");
  }
}
