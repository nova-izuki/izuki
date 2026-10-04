package com.novaizuki.mobile;

import android.accessibilityservice.AccessibilityService;
import android.animation.ValueAnimator;
import android.content.ComponentName;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.RadialGradient;
import android.graphics.Rect;
import android.graphics.Shader;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Izuki's eyes and hands on Android and Android TV — switched on by the user
 * in Accessibility settings, and only ever used when they ask for something.
 *
 * It can read what's on the screen (the text and the buttons — never
 * passwords), press, type and scroll there, use Back / Home, and show
 * Izuki's little orb over other apps while it listens or talks.
 */
public class IzukiAccessibilityService extends AccessibilityService {
  private static volatile IzukiAccessibilityService active;
  /** What the last screen read listed, by number, for "press number 4". */
  private static final List<AccessibilityNodeInfo> listed = new ArrayList<>();

  @Override public void onServiceConnected() { active = this; }
  @Override public void onAccessibilityEvent(AccessibilityEvent event) { /* nothing is collected in the background */ }
  @Override public void onInterrupt() { }
  @Override public boolean onUnbind(android.content.Intent intent) {
    hideOrb();
    active = null;
    return super.onUnbind(intent);
  }

  static boolean isEnabled(Context context) {
    String enabled = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
    if (enabled == null) return false;
    String component = new ComponentName(context, IzukiAccessibilityService.class).flattenToString();
    return enabled.toLowerCase().contains(component.toLowerCase());
  }

  static boolean running() { return active != null; }

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

  // ---- seeing the screen ---------------------------------------------------

  /** The app in front and what's on screen: [{n, text, kind, x, y, w, h, focused}]. */
  static JSONObject screen() throws JSONException {
    IzukiAccessibilityService service = active;
    JSONObject out = new JSONObject();
    JSONArray items = new JSONArray();
    synchronized (listed) {
      listed.clear();
      AccessibilityNodeInfo root = service == null ? null : service.getRootInActiveWindow();
      if (root != null) {
        out.put("app", root.getPackageName() == null ? "" : root.getPackageName().toString());
        walk(root, items, 0);
      }
    }
    out.put("items", items);
    return out;
  }

  private static void walk(AccessibilityNodeInfo node, JSONArray items, int depth) throws JSONException {
    if (node == null || depth > 40 || listed.size() >= 160) return;
    if (!node.isVisibleToUser()) return;
    String text = node.getText() == null ? "" : node.getText().toString();
    String desc = node.getContentDescription() == null ? "" : node.getContentDescription().toString();
    boolean acts = node.isClickable() || node.isFocusable() || node.isEditable() || node.isCheckable() || node.isScrollable();
    if (node.isPassword()) text = ""; // never read passwords
    String label = (text.isEmpty() ? desc : text).replaceAll("\\s+", " ").trim();
    if (!label.isEmpty() || (acts && node.isEditable())) {
      Rect r = new Rect();
      node.getBoundsInScreen(r);
      JSONObject it = new JSONObject();
      it.put("n", listed.size() + 1);
      it.put("text", label.length() > 120 ? label.substring(0, 120) : label);
      it.put("kind", node.isEditable() ? "box" : node.isCheckable() ? "switch" : (node.isClickable() || node.isFocusable()) ? "button" : "text");
      it.put("x", r.left); it.put("y", r.top); it.put("w", r.width()); it.put("h", r.height());
      if (node.isFocused() || node.isAccessibilityFocused()) it.put("focused", true);
      if (node.isChecked()) it.put("on", true);
      items.put(it);
      listed.add(AccessibilityNodeInfo.obtain(node));
    }
    for (int i = 0; i < node.getChildCount(); i++) walk(node.getChild(i), items, depth + 1);
  }

  private static AccessibilityNodeInfo item(int n) {
    synchronized (listed) {
      return n >= 1 && n <= listed.size() ? listed.get(n - 1) : null;
    }
  }

  /** Press thing number n: it, or the nearest parent that can be pressed. */
  static boolean click(int n) {
    AccessibilityNodeInfo node = item(n);
    if (node == null) return false;
    node.refresh();
    AccessibilityNodeInfo target = node;
    for (int i = 0; i < 6 && target != null && !target.isClickable(); i++) target = target.getParent();
    if (target != null && target.performAction(AccessibilityNodeInfo.ACTION_CLICK)) return true;
    // TV cards are often "focus then OK": focus it, then select.
    node.performAction(AccessibilityNodeInfo.ACTION_FOCUS);
    return node.performAction(AccessibilityNodeInfo.ACTION_SELECT) || node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
  }

  /** Move the TV's focus to thing number n (the highlight, as with the remote). */
  static boolean focus(int n) {
    AccessibilityNodeInfo node = item(n);
    return node != null && node.performAction(AccessibilityNodeInfo.ACTION_FOCUS);
  }

  /** Put words in box number n (or the focused box when n is 0). */
  static boolean type(int n, String words) {
    AccessibilityNodeInfo node = n > 0 ? item(n) : null;
    if (node == null && active != null) {
      AccessibilityNodeInfo root = active.getRootInActiveWindow();
      node = root == null ? null : root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
    }
    if (node == null) return false;
    Bundle args = new Bundle();
    args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, words);
    node.performAction(AccessibilityNodeInfo.ACTION_FOCUS);
    return node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args);
  }

  /** Scroll the first thing that scrolls ("down"/"up"). */
  static boolean scroll(String dir) {
    IzukiAccessibilityService service = active;
    AccessibilityNodeInfo root = service == null ? null : service.getRootInActiveWindow();
    AccessibilityNodeInfo s = findScrollable(root, 0);
    if (s == null) return false;
    return s.performAction("up".equals(dir) || "left".equals(dir) ? AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD : AccessibilityNodeInfo.ACTION_SCROLL_FORWARD);
  }

  private static AccessibilityNodeInfo findScrollable(AccessibilityNodeInfo node, int depth) {
    if (node == null || depth > 30) return null;
    if (node.isScrollable() && node.isVisibleToUser()) return node;
    for (int i = 0; i < node.getChildCount(); i++) {
      AccessibilityNodeInfo f = findScrollable(node.getChild(i), depth + 1);
      if (f != null) return f;
    }
    return null;
  }

  // ---- the little orb over other apps ----------------------------------------

  private static View orbView;
  private static OrbDot dot;
  private static TextView caption;
  private static final Handler ui = new Handler(Looper.getMainLooper());

  /** Show the orb in a corner over whatever's on ("listen", "think", "talk"), or hide it ("idle"). */
  static void orb(String state, String words) {
    ui.post(() -> {
      IzukiAccessibilityService service = active;
      if (service == null) return;
      if (state == null || "idle".equals(state) || "hide".equals(state)) { hideOrb(); return; }
      if (orbView == null) {
        WindowManager wm = (WindowManager) service.getSystemService(WINDOW_SERVICE);
        LinearLayout box = new LinearLayout(service);
        box.setOrientation(LinearLayout.HORIZONTAL);
        box.setGravity(Gravity.CENTER_VERTICAL);
        int pad = dp(service, 14);
        box.setPadding(pad, pad / 2, pad * 2, pad / 2);
        android.graphics.drawable.GradientDrawable bg = new android.graphics.drawable.GradientDrawable();
        bg.setColor(Color.argb(200, 8, 9, 20));
        bg.setCornerRadius(dp(service, 40));
        box.setBackground(bg);
        dot = new OrbDot(service);
        box.addView(dot, new LinearLayout.LayoutParams(dp(service, 64), dp(service, 64)));
        caption = new TextView(service);
        caption.setTextColor(Color.WHITE);
        caption.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        caption.setMaxWidth(dp(service, 520));
        caption.setMaxLines(3);
        caption.setPadding(dp(service, 12), 0, 0, 0);
        box.addView(caption);
        WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
          WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT,
          WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
          WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
          PixelFormat.TRANSLUCENT);
        lp.gravity = Gravity.BOTTOM | Gravity.END;
        lp.x = dp(service, 40); lp.y = dp(service, 40);
        try { wm.addView(box, lp); orbView = box; } catch (Exception e) { return; }
      }
      dot.setState(state);
      String shown = words != null && !words.isEmpty() ? words
        : "listen".equals(state) ? "Listening…" : "think".equals(state) ? "Thinking…" : "";
      caption.setText(shown);
      caption.setVisibility(shown.isEmpty() ? View.GONE : View.VISIBLE);
    });
  }

  private static void hideOrb() {
    ui.post(() -> {
      IzukiAccessibilityService service = active;
      if (orbView != null && service != null) {
        try { ((WindowManager) service.getSystemService(WINDOW_SERVICE)).removeView(orbView); } catch (Exception ignored) { }
      }
      if (dot != null) dot.stop();
      orbView = null; dot = null; caption = null;
    });
  }

  private static int dp(Context c, int v) {
    return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, c.getResources().getDisplayMetrics());
  }

  /** A small glowing glass orb that breathes, pulses while talking and spins its light while thinking. */
  static class OrbDot extends View {
    private final Paint glow = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint body = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint shine = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final ValueAnimator clock = ValueAnimator.ofFloat(0f, 1f);
    private String state = "listen";
    private float t = 0f;

    OrbDot(Context c) {
      super(c);
      clock.setDuration(100000);
      clock.setRepeatCount(ValueAnimator.INFINITE);
      clock.addUpdateListener(a -> { t = (float) a.getCurrentPlayTime() / 1000f; invalidate(); });
      clock.start();
    }

    void setState(String s) { state = s; }
    void stop() { clock.cancel(); }

    @Override protected void onDraw(Canvas c) {
      float w = getWidth(), h = getHeight(), cx = w / 2, cy = h / 2;
      float base = Math.min(w, h) / 2 * 0.72f;
      float beat = "talk".equals(state) ? 0.10f * (float) Math.abs(Math.sin(t * 7.0)) : "listen".equals(state) ? 0.05f * (float) Math.sin(t * 3.0) : 0.03f * (float) Math.sin(t * 1.6);
      float r = base * (1 + beat);
      int a = Color.rgb(124, 92, 255), b = Color.rgb(78, 205, 196);
      if ("think".equals(state)) { a = Color.rgb(103, 232, 249); b = Color.rgb(167, 139, 250); }
      glow.setShader(new RadialGradient(cx, cy, r * 1.45f, new int[] { Color.argb(150, Color.red(a), Color.green(a), Color.blue(a)), Color.TRANSPARENT }, null, Shader.TileMode.CLAMP));
      c.drawCircle(cx, cy, r * 1.45f, glow);
      float ang = "think".equals(state) ? t * 4f : t * 0.8f;
      float ox = (float) Math.cos(ang) * r * 0.35f, oy = (float) Math.sin(ang) * r * 0.35f;
      body.setShader(new RadialGradient(cx + ox, cy + oy, r * 1.3f, new int[] { b, a, Color.rgb(20, 16, 48) }, new float[] { 0f, 0.55f, 1f }, Shader.TileMode.CLAMP));
      c.drawCircle(cx, cy, r, body);
      shine.setShader(new RadialGradient(cx - r * 0.35f, cy - r * 0.4f, r * 0.45f, new int[] { Color.argb(200, 255, 255, 255), Color.TRANSPARENT }, null, Shader.TileMode.CLAMP));
      c.drawCircle(cx - r * 0.35f, cy - r * 0.4f, r * 0.45f, shine);
    }
  }
}
