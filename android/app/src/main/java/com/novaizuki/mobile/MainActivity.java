package com.novaizuki.mobile;

import com.getcapacitor.BridgeActivity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
  /** Izuki's own page is the window in front (so an Izuki window elsewhere is the orb). */
  static volatile boolean inFront = false;

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

  /**
   * Back in front, often from Android Settings: the page re-checks every
   * permission at once instead of showing what was true before it left. The
   * wake listener steps aside while the page owns the microphone.
   */
  @Override
  public void onResume() {
    super.onResume();
    inFront = true;
    IzukiWakeService.foreground(this, true);
    // Coming back from Settings must never leave a wake/page orb over the
    // permission screen. The page redraws its own orb when it actually needs one.
    IzukiAccessibilityService.orbFor("wake", "idle", "");
    IzukiAccessibilityService.orbFor("page", "idle", "");
    IzukiControlPlugin.notifyResume();
  }

  @Override
  public void onPause() {
    inFront = false;
    super.onPause();
  }

  @Override
  public void onStop() {
    IzukiWakeService.foreground(this, false);
    super.onStop();
  }

  @Override
  public void onDestroy() {
    try { unregisterReceiver(unlockReceiver); } catch (Exception ignored) { }
    super.onDestroy();
  }

  /**
   * The wake listener posts a phrase; the web page takes it when it is ready.
   * MainActivity is exported for the launcher, so never trust a phrase in the
   * intent: require the one-use token minted by our own service/tile. Another
   * app can open Izuki, but it cannot make the assistant talk.
   */
  private void handleWake(Intent intent) {
    if (intent == null) return;
    String token = intent.getStringExtra("izuki_wake_token");
    if (!IzukiControlPlugin.consumeWakeHandoff(token)) return;
    // The producer already emitted the wake event for a warm page (with the
    // actual spoken phrase); a cold page takes the pending phrase from the
    // plugin. Do not emit a second, bare event here: it could overwrite the
    // command while the page is waiting on device().
    intent.removeExtra("izuki_wake_token");
  }
}
