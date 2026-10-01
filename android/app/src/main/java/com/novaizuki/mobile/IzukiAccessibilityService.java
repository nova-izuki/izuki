package com.novaizuki.mobile;

import android.accessibilityservice.AccessibilityService;
import android.content.ComponentName;
import android.content.Context;
import android.provider.Settings;
import android.view.accessibility.AccessibilityEvent;

/**
 * Opt-in Android navigation only. Android itself shows the enable screen and
 * the service never starts actions by itself: the companion must request a
 * small allowlisted action after the user speaks/types it.
 */
public class IzukiAccessibilityService extends AccessibilityService {
  private static volatile IzukiAccessibilityService active;

  @Override public void onServiceConnected() { active = this; }
  @Override public void onAccessibilityEvent(AccessibilityEvent event) { /* no background harvesting */ }
  @Override public void onInterrupt() { }
  @Override public boolean onUnbind(android.content.Intent intent) { active = null; return super.onUnbind(intent); }

  static boolean isEnabled(Context context) {
    String enabled = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
    if (enabled == null) return false;
    String component = new ComponentName(context, IzukiAccessibilityService.class).flattenToString();
    return enabled.toLowerCase().contains(component.toLowerCase());
  }

  static boolean perform(String action) {
    IzukiAccessibilityService service = active;
    if (service == null) return false;
    int global;
    switch (action) {
      case "home": global = GLOBAL_ACTION_HOME; break;
      case "back": global = GLOBAL_ACTION_BACK; break;
      case "recents": global = GLOBAL_ACTION_RECENTS; break;
      case "notifications": global = GLOBAL_ACTION_NOTIFICATIONS; break;
      case "quick_settings": global = GLOBAL_ACTION_QUICK_SETTINGS; break;
      default: return false;
    }
    return service.performGlobalAction(global);
  }
}
