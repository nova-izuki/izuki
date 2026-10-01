package com.novaizuki.mobile;

import android.content.Intent;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Deliberately small, explicit Android-control bridge for the companion. */
@CapacitorPlugin(name = "IzukiControl")
public class IzukiControlPlugin extends Plugin {
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
    call.resolve(result);
  }

  @PluginMethod
  public void openAccessibilitySettings(PluginCall call) {
    getActivity().startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
    call.resolve();
  }

  @PluginMethod
  public void perform(PluginCall call) {
    String action = call.getString("action", "");
    if (!IzukiAccessibilityService.perform(action)) {
      call.reject("Android control is off. Enable Izuki Companion in Accessibility settings first.");
      return;
    }
    JSObject result = new JSObject();
    result.put("done", true);
    call.resolve(result);
  }
}
