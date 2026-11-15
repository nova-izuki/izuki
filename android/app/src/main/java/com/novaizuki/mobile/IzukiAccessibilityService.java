package com.novaizuki.mobile;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.accessibilityservice.GestureDescription;
import android.animation.ValueAnimator;
import android.app.KeyguardManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PixelFormat;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.RadialGradient;
import android.graphics.Rect;
import android.graphics.Shader;
import android.graphics.SweepGradient;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.provider.Settings;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.Display;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityManager;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityWindowInfo;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.RequiresApi;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;
import java.util.regex.Pattern;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Izuki's eyes and hands on Android and Android TV — switched on by the user
 * in Accessibility settings, and only ever used when they ask for something.
 *
 * It can read what's on the screen (the text and the buttons — never
 * passwords), take a picture of it when asked ("what's on my screen?"),
 * press, type and scroll there, use Back / Home, and show Izuki's little orb
 * over other apps. The orb is an accessibility overlay
 * (TYPE_ACCESSIBILITY_OVERLAY): it needs this service, not Android's
 * "Appear on top" permission, which is why Izuki isn't listed there.
 *
 * Every action says what really happened: pressed through Android's
 * accessibility action, or by a real touch Android confirmed, or why not.
 *
 * Paywall guard (on/off on the Izuki screen): when an app changes screen,
 * its words are checked here on the TV for "start free trial", "choose a
 * plan", "$9.99/month"… and Izuki says so, with the free apps on this TV.
 * Nothing is kept or sent anywhere.
 */
public class IzukiAccessibilityService extends AccessibilityService {
  private static volatile IzukiAccessibilityService active;
  /** What the last screen read listed, by number, for "press number 4". */
  private static final List<AccessibilityNodeInfo> listed = new ArrayList<>();
  private static volatile long connectedAt = 0;
  private static volatile long disconnectedAt = 0;

  @Override public void onServiceConnected() {
    active = this;
    connectedAt = System.currentTimeMillis();
    watching = getSharedPreferences(PREFS, MODE_PRIVATE).getBoolean("watch", false);
    IzukiControlPlugin.notifyControl(true);
  }

  @Override public void onAccessibilityEvent(AccessibilityEvent event) {
    // A new screen with the orb up: if it's Android Settings, the orb goes.
    if (event != null && event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED && orbView != null) {
      ui.post(settingsGuard);
    }
    // Only the paywall guard listens, and only to "a new screen opened".
    if (!watching || event == null || event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return;
    CharSequence pkg = event.getPackageName();
    if (pkg == null) return;
    String p = pkg.toString();
    if (p.equals(getPackageName()) || p.startsWith("com.android.systemui") || p.contains("launcher") || p.contains("tvlauncher")) return;
    ui.removeCallbacks(checkPaywall);
    // A paywall can take a moment to draw: look now-ish and once more.
    ui.postDelayed(checkPaywall, 1500);
    ui.postDelayed(checkPaywall, 5000);
  }
  @Override public void onInterrupt() { }
  @Override public boolean onUnbind(Intent intent) {
    gone();
    return super.onUnbind(intent);
  }
  @Override public void onDestroy() {
    gone();
    super.onDestroy();
  }

  private void gone() {
    if (active != this) return;
    hideOrb();
    synchronized (listed) { releaseListed(); }
    active = null;
    disconnectedAt = System.currentTimeMillis();
    IzukiControlPlugin.notifyControl(false);
  }

  /**
   * Is Izuki's service switched on in Android's settings? Asked of
   * AccessibilityManager first (the authority), then of the settings list,
   * read entry by entry: Samsung and others may store the short
   * "package/.Class" form, which the old substring test missed — Izuki kept
   * showing "Enable Android controls" for a service that was already on.
   */
  static boolean isEnabled(Context context) {
    String pkg = context.getPackageName();
    String cls = IzukiAccessibilityService.class.getName();
    try {
      AccessibilityManager am = (AccessibilityManager) context.getSystemService(Context.ACCESSIBILITY_SERVICE);
      if (am != null) {
        for (AccessibilityServiceInfo info : am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)) {
          ServiceInfo si = info.getResolveInfo() == null ? null : info.getResolveInfo().serviceInfo;
          if (si != null && pkg.equals(si.packageName) && cls.equals(si.name)) return true;
        }
      }
    } catch (Exception ignored) { }
    return ControlState.listed(Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES), pkg, cls);
  }

  /** The accessibility layer is on and actually connected, not merely enabled. */
  static boolean ready() { return active != null; }

  static boolean running() { return active != null; }

  static long connectedAt() { return active != null ? connectedAt : 0; }

  static long disconnectedAt() { return disconnectedAt; }

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
      case "power": global = GLOBAL_ACTION_POWER_DIALOG; break;
      case "lock":
        if (Build.VERSION.SDK_INT < 28) return false;
        global = GLOBAL_ACTION_LOCK_SCREEN;
        break;
      case "screenshot":
        if (Build.VERSION.SDK_INT < 28) return false;
        global = GLOBAL_ACTION_TAKE_SCREENSHOT;
        break;
      default: return false;
    }
    return service.performGlobalAction(global);
  }

  // ---- seeing the screen ---------------------------------------------------

  /**
   * The window the person is using: the active one, unless that is Izuki's
   * own orb, in which case the focused app window under it.
   */
  private static AccessibilityNodeInfo appRoot(IzukiAccessibilityService service) {
    AccessibilityNodeInfo root = service.getRootInActiveWindow();
    try {
      // The active window can be Izuki's own non-focusable orb. Never read the
      // orb as "the screen": find the focused application window under it.
      if (root != null) {
        int id = root.getWindowId();
        boolean overlay = false;
        for (AccessibilityWindowInfo w : service.getWindows()) {
          if (w.getId() == id && w.getType() == AccessibilityWindowInfo.TYPE_ACCESSIBILITY_OVERLAY) { overlay = true; break; }
        }
        if (!overlay) return root;
      }
      for (AccessibilityWindowInfo w : service.getWindows()) {
        if (w.getType() != AccessibilityWindowInfo.TYPE_APPLICATION) continue;
        if (!w.isFocused() && !w.isActive()) continue;
        AccessibilityNodeInfo r = w.getRoot();
        if (r != null) return r;
      }
    } catch (Exception ignored) { }
    return root;
  }

  /** Android's own Settings / permission screens: the orb is never shown over them. */
  private static boolean settingsInFront(IzukiAccessibilityService service) {
    try {
      AccessibilityNodeInfo root = service.getRootInActiveWindow();
      CharSequence pkg = root == null ? null : root.getPackageName();
      if (pkg == null) return false;
      String p = pkg.toString().toLowerCase(Locale.ROOT);
      return p.equals("com.android.settings") || p.contains(".settings") || p.contains("permissioncontroller");
    } catch (Exception e) {
      return false;
    }
  }

  /** The app in front and what's on screen: [{n, text, kind, x, y, w, h, focused, id}]. */
  static JSONObject screen() throws JSONException {
    IzukiAccessibilityService service = active;
    JSONObject out = new JSONObject();
    JSONArray items = new JSONArray();
    if (service != null) {
      DisplayMetrics dm = service.getResources().getDisplayMetrics();
      out.put("w", dm.widthPixels);
      out.put("h", dm.heightPixels);
      out.put("density", dm.density);
      out.put("locked", locked(service));
    }
    long began = SystemClock.elapsedRealtime();
    synchronized (listed) {
      releaseListed();
      AccessibilityNodeInfo root = service == null ? null : appRoot(service);
      if (root != null) {
        out.put("app", root.getPackageName() == null ? "" : root.getPackageName().toString());
        walk(root, items, 0);
      }
    }
    out.put("items", items);
    out.put("ms", SystemClock.elapsedRealtime() - began);
    return out;
  }

  /** Free the copies a previous screen read kept; without this every read leaked nodes. */
  private static void releaseListed() {
    for (AccessibilityNodeInfo node : listed) {
      try { node.recycle(); } catch (Exception ignored) { }
    }
    listed.clear();
  }

  static boolean locked(Context context) {
    KeyguardManager km = (KeyguardManager) context.getSystemService(Context.KEYGUARD_SERVICE);
    return km != null && km.isKeyguardLocked();
  }

  private static final int MAX_ITEMS = 220;

  private static String labelOf(AccessibilityNodeInfo node) {
    String text = node.getText() == null ? "" : node.getText().toString();
    String desc = node.getContentDescription() == null ? "" : node.getContentDescription().toString();
    String hint = "";
    if (Build.VERSION.SDK_INT >= 26 && text.isEmpty() && desc.isEmpty() && node.getHintText() != null) hint = node.getHintText().toString();
    return (!text.isEmpty() ? text : !desc.isEmpty() ? desc : hint).replaceAll("\\s+", " ").trim();
  }

  private static void walk(AccessibilityNodeInfo node, JSONArray items, int depth) throws JSONException {
    if (node == null || depth > 60 || listed.size() >= MAX_ITEMS) return;
    if (!node.isVisibleToUser()) return;
    // Never read a password field, and never let its hint/description stand in
    // for the value either. Skip its subtree: there is nothing safe in there.
    if (node.isPassword()) return;
    String label = labelOf(node);
    boolean acts = node.isClickable() || node.isFocusable() || node.isEditable() || node.isCheckable() || node.isScrollable();
    boolean scrollable = node.isScrollable();
    // Icon-only buttons and scroll strips often have no text. They are still
    // controls: list them with bounds so Autopilot can reach them.
    if (label.isEmpty() && (scrollable || (acts && node.isClickable()))) {
      String id = node.getViewIdResourceName();
      label = scrollable ? "Scrollable area"
          : id != null && !id.isEmpty() ? id.substring(id.indexOf('/') + 1) : "Control";
    }
    if (!label.isEmpty()) {
      Rect r = new Rect();
      node.getBoundsInScreen(r);
      JSONObject it = new JSONObject();
      it.put("n", listed.size() + 1);
      it.put("text", label.length() > 120 ? label.substring(0, 120) : label);
      it.put("kind", node.isEditable() ? "box" : node.isCheckable() ? "switch" : scrollable ? "scroll" : (node.isClickable() || node.isFocusable()) ? "button" : "text");
      it.put("x", r.left); it.put("y", r.top); it.put("w", r.width()); it.put("h", r.height());
      if (node.isFocused() || node.isAccessibilityFocused()) it.put("focused", true);
      if (node.isChecked()) it.put("on", true);
      if (!node.isEnabled()) it.put("disabled", true);
      String id = node.getViewIdResourceName();
      if (id != null && !id.isEmpty()) it.put("id", id.substring(id.indexOf('/') + 1));
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

  /** The node itself if it can be pressed, else the nearest parent that can. */
  private static AccessibilityNodeInfo pressable(AccessibilityNodeInfo node) {
    AccessibilityNodeInfo target = node;
    for (int i = 0; i < 8 && target != null; i++) {
      if (target.isClickable() || target.isEditable() || target.isCheckable()) return target;
      target = target.getParent();
    }
    return null;
  }

  // ---- doing things, with an honest result -----------------------------------------

  /** {done, how, reason, matched}: how = "action" (accessibility) or "touch" (a confirmed gesture). */
  private static JSONObject result(boolean done, String how, String reason) {
    JSONObject out = new JSONObject();
    try {
      out.put("done", done);
      if (how != null) out.put("how", how);
      if (reason != null) out.put("reason", reason);
    } catch (JSONException ignored) { }
    return out;
  }

  private static void put(JSONObject o, String key, Object value) {
    try { o.put(key, value); } catch (JSONException ignored) { }
  }

  static void off(Consumer<JSONObject> done) { done.accept(result(false, null, "off")); }

  /**
   * Press `node`: Android's click action on it (or its pressable parent); if
   * Android has no such action there, a real tap on its centre, confirmed by
   * Android. A click that was performed is never repeated as a tap: doing it
   * twice could toggle a switch back or press the next screen's button.
   */
  private static void press(AccessibilityNodeInfo node, String matched, boolean preferTouch, Consumer<JSONObject> done) {
    node.refresh();
    if (!node.isVisibleToUser()) { done.accept(result(false, null, "hidden")); return; }
    boolean revealed = false;
    try { revealed = node.performAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_SHOW_ON_SCREEN.getId()); } catch (Exception ignored) { }
    if (revealed) {
      // It may have scrolled: let it settle, then read the node again — a
      // node's bounds are a snapshot, and a stale one taps the wrong thing.
      try { Thread.sleep(250); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
      node.refresh();
      if (!node.isVisibleToUser()) { done.accept(result(false, null, "hidden")); return; }
    }
    AccessibilityNodeInfo target = pressable(node);
    AccessibilityNodeInfo used = target != null ? target : node;
    // A WebView button may report itself disabled while its HTML parent is
    // pressable, so only refuse when both the label and the target are off.
    if (!used.isEnabled() && !node.isEnabled()) { JSONObject r = result(false, null, "disabled"); put(r, "matched", matched); done.accept(r); return; }
    if (!preferTouch) {
      if (target != null && target.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
        JSONObject r = result(true, "action", null);
        put(r, "matched", matched);
        done.accept(r);
        return;
      }
      // TV cards are often "focus then OK".
      node.performAction(AccessibilityNodeInfo.ACTION_FOCUS);
      if (used.performAction(AccessibilityNodeInfo.ACTION_SELECT) || node.performAction(AccessibilityNodeInfo.ACTION_SELECT)) {
        JSONObject r = result(true, "select", null);
        put(r, "matched", matched);
        done.accept(r);
        return;
      }
    }
    // Tap the label itself, not a huge ancestor card: the touch lands inside
    // the real control and bubbles to its row. Fall back to the parent only
    // when the label has no usable bounds.
    Rect b = new Rect();
    node.refresh();
    node.getBoundsInScreen(b);
    if (b.isEmpty()) { used.refresh(); used.getBoundsInScreen(b); }
    if (b.isEmpty()) { JSONObject r = result(false, null, "no-bounds"); put(r, "matched", matched); done.accept(r); return; }
    gesture("tap", b.exactCenterX(), b.exactCenterY(), 0, 0, 60, (touch) -> {
      put(touch, "matched", matched);
      if (touch.optBoolean("done")) put(touch, "how", "touch");
      done.accept(touch);
    });
  }

  /** The companion is a WebView: native click actions there are less reliable than a real tap. */
  private static boolean preferTouch(AccessibilityNodeInfo node, IzukiAccessibilityService service) {
    if (node == null) return false;
    String cls = node.getClassName() == null ? "" : node.getClassName().toString().toLowerCase(Locale.ROOT);
    String pkg = node.getPackageName() == null ? "" : node.getPackageName().toString();
    return cls.contains("webview") || pkg.equals(service.getPackageName());
  }

  /** Press thing number n from the last screen read. */
  static void click(int n, Consumer<JSONObject> done) {
    AccessibilityNodeInfo node = item(n);
    if (active == null) { off(done); return; }
    if (node == null) { done.accept(result(false, null, "stale")); return; }
    press(node, labelOf(node), preferTouch(node, active), done);
  }

  /** Move the TV's focus to thing number n (the highlight, as with the remote). */
  static boolean focus(int n) {
    AccessibilityNodeInfo node = item(n);
    return node != null && node.performAction(AccessibilityNodeInfo.ACTION_FOCUS);
  }

  /** Put words in box number n (or the focused box when n is 0), then read them back. */
  static JSONObject type(int n, String words) {
    IzukiAccessibilityService service = active;
    if (service == null) return result(false, null, "off");
    AccessibilityNodeInfo node = n > 0 ? item(n) : null;
    if (node == null) {
      AccessibilityNodeInfo root = appRoot(service);
      node = root == null ? null : root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
    }
    if (node == null) return result(false, null, "no-box");
    node.refresh();
    if (node.isPassword()) return result(false, null, "password");
    if (!node.isEditable()) {
      AccessibilityNodeInfo box = node.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
      if (box != null) node = box;
      // The box actually typed into: never a password field.
      if (node.isPassword()) return result(false, null, "password");
    }
    Bundle args = new Bundle();
    args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, words);
    node.performAction(AccessibilityNodeInfo.ACTION_FOCUS);
    if (!node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)) return result(false, null, "refused");
    node.refresh();
    CharSequence now = node.getText();
    boolean verified = now != null && now.toString().replace(' ', ' ').trim().toLowerCase(Locale.ROOT)
        .contains(String.valueOf(words).trim().toLowerCase(Locale.ROOT));
    JSONObject r = result(true, "action", verified ? null : "unconfirmed");
    put(r, "verified", verified);
    return r;
  }

  /** Scroll the main scrolling area ("down"/"up"): the biggest one on screen, not a chip strip. */
  static JSONObject scroll(String dir) {
    IzukiAccessibilityService service = active;
    if (service == null) return result(false, null, "off");
    AccessibilityNodeInfo root = appRoot(service);
    AccessibilityNodeInfo s = biggestScrollable(root);
    if (s == null) return result(false, null, "nothing-scrolls");
    boolean back = "up".equals(dir) || "left".equals(dir);
    boolean moved = s.performAction(back ? AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD : AccessibilityNodeInfo.ACTION_SCROLL_FORWARD);
    return moved ? result(true, "action", null) : result(false, null, back ? "at-top" : "at-end");
  }

  private static AccessibilityNodeInfo biggestScrollable(AccessibilityNodeInfo root) {
    if (root == null) return null;
    List<AccessibilityNodeInfo> found = new ArrayList<>();
    collectScrollable(root, 0, found);
    AccessibilityNodeInfo best = null;
    long bestArea = -1;
    Rect r = new Rect();
    for (AccessibilityNodeInfo node : found) {
      node.getBoundsInScreen(r);
      long area = (long) r.width() * r.height();
      if (area > bestArea) { best = node; bestArea = area; }
    }
    return best;
  }

  private static void collectScrollable(AccessibilityNodeInfo node, int depth, List<AccessibilityNodeInfo> out) {
    if (node == null || depth > 40 || out.size() > 20) return;
    if (!node.isVisibleToUser()) return;
    if (node.isScrollable()) out.add(node);
    for (int i = 0; i < node.getChildCount(); i++) collectScrollable(node.getChild(i), depth + 1, out);
  }

  // ---- real touch gestures -------------------------------------------------

  /**
   * Tap, long-press or swipe at real screen coordinates (Android 7+). `done`
   * gets Android's own answer (completed or cancelled), not just "sent".
   */
  static void gesture(String op, float x1, float y1, float x2, float y2, long ms, Consumer<JSONObject> done) {
    IzukiAccessibilityService service = active;
    if (service == null) { off(done); return; }
    if (Build.VERSION.SDK_INT < 24) { done.accept(result(false, null, "old-android")); return; }
    DisplayMetrics dm = service.getResources().getDisplayMetrics();
    if (x1 < 0 || y1 < 0 || x1 > dm.widthPixels * 1.05f || y1 > dm.heightPixels * 1.1f) { done.accept(result(false, null, "off-screen")); return; }
    Path path = new Path();
    long duration;
    if ("tap".equals(op)) {
      path.moveTo(x1, y1);
      duration = 60;
    } else if ("longpress".equals(op)) {
      path.moveTo(x1, y1);
      duration = Math.max(500, Math.min(2000, ms));
    } else if ("swipe".equals(op)) {
      path.moveTo(x1, y1);
      path.lineTo(x2, y2);
      duration = Math.max(80, Math.min(2500, ms));
    } else {
      done.accept(result(false, null, "unknown-gesture"));
      return;
    }
    GestureDescription gesture = new GestureDescription.Builder()
      .addStroke(new GestureDescription.StrokeDescription(path, 0, duration))
      .build();
    AtomicBoolean answered = new AtomicBoolean(false);
    Consumer<JSONObject> once = (r) -> { if (answered.compareAndSet(false, true)) done.accept(r); };
    // AccessibilityService expects gesture dispatch on its main thread.
    ui.post(() -> {
      boolean sent;
      try {
        sent = service.dispatchGesture(gesture, new GestureResultCallback() {
          @Override public void onCompleted(GestureDescription g) { once.accept(result(true, "touch", null)); }
          @Override public void onCancelled(GestureDescription g) { once.accept(result(false, null, "cancelled")); }
        }, null);
      } catch (Exception e) {
        sent = false;
      }
      if (!sent) once.accept(result(false, null, "refused"));
    });
    ui.postDelayed(() -> once.accept(result(false, null, "unconfirmed")), duration + 2500);
  }

  /**
   * Press the visible control whose label is `query`. Exact labels beat
   * partial ones. A label is usually a text inside a pressable row or card
   * that has no text of its own: the old search skipped those, so "tap
   * Wi-Fi" failed on most settings screens. Risky controls (send, pay, buy,
   * delete…) are only pressed when the request named them.
   */
  static void tapText(String query, Consumer<JSONObject> done) {
    IzukiAccessibilityService service = active;
    if (service == null) { off(done); return; }
    if (query == null || query.trim().isEmpty()) { done.accept(result(false, null, "no-label")); return; }
    String q = query.trim();
    List<AccessibilityNodeInfo> nodes = new ArrayList<>();
    List<String> labels = new ArrayList<>();
    for (AccessibilityNodeInfo root : rootsFor(service)) gatherLabels(root, 0, nodes, labels);
    if (labels.isEmpty()) { done.accept(result(false, null, "no-window")); return; }
    int best = ControlState.bestLabel(labels, q);
    if (best < 0) { done.accept(result(false, null, "not-found")); return; }
    String matched = labels.get(best);
    if (!ControlState.riskyAllowed(matched, q)) {
      JSONObject r = result(false, null, "needs-person");
      put(r, "matched", matched);
      done.accept(r);
      return;
    }
    press(nodes.get(best), matched, preferTouch(nodes.get(best), service), done);
  }

  /** The active window plus dialogs/permission sheets that own their own window. */
  private static List<AccessibilityNodeInfo> rootsFor(IzukiAccessibilityService service) {
    List<AccessibilityNodeInfo> roots = new ArrayList<>();
    try {
      AccessibilityNodeInfo activeRoot = appRoot(service);
      if (activeRoot != null) roots.add(activeRoot);
      for (AccessibilityWindowInfo w : service.getWindows()) {
        if (w.getType() != AccessibilityWindowInfo.TYPE_APPLICATION && w.getType() != AccessibilityWindowInfo.TYPE_SYSTEM) continue;
        AccessibilityNodeInfo r = w.getRoot();
        if (r == null) continue;
        boolean seen = false;
        for (AccessibilityNodeInfo old : roots) if (old.getWindowId() == r.getWindowId()) { seen = true; break; }
        if (!seen) roots.add(r);
      }
    } catch (Exception ignored) { }
    return roots;
  }

  private static void gatherLabels(AccessibilityNodeInfo node, int depth, List<AccessibilityNodeInfo> nodes, List<String> labels) {
    if (node == null || depth > 60 || nodes.size() > 600) return;
    if (!node.isVisibleToUser() || node.isPassword()) return;
    String label = labelOf(node);
    if (!label.isEmpty()) { nodes.add(node); labels.add(label); }
    for (int i = 0; i < node.getChildCount(); i++) gatherLabels(node.getChild(i), depth + 1, nodes, labels);
  }

  /**
   * Press Enter/Search on the focused field, or a Search/Go control on screen.
   * Never "Send": in a chat box that would send the message.
   */
  static void submit(Consumer<JSONObject> done) {
    IzukiAccessibilityService service = active;
    if (service == null) { off(done); return; }
    AccessibilityNodeInfo root = appRoot(service);
    if (root == null) { done.accept(result(false, null, "no-window")); return; }
    AccessibilityNodeInfo node = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
    // Android doesn't expose a box's Enter action (Search vs Send), so Enter
    // is only pressed in a box that says it's for searching or an address;
    // a chat composer gets the Search/Go control below, or nothing.
    if (node != null && Build.VERSION.SDK_INT >= 30 && looksLikeSearch(node)
        && node.performAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_IME_ENTER.getId())) {
      done.accept(result(true, "enter", null));
      return;
    }
    List<AccessibilityNodeInfo> nodes = new ArrayList<>();
    List<String> labels = new ArrayList<>();
    gatherLabels(root, 0, nodes, labels);
    for (String word : new String[] { "search", "go" }) {
      int best = ControlState.bestLabel(labels, word);
      if (best >= 0 && ControlState.wholeWord(labels.get(best), word)) { press(nodes.get(best), labels.get(best), preferTouch(nodes.get(best), service), done); return; }
    }
    done.accept(result(false, null, "no-search-control"));
  }

  /** A search or address box: its hint, id, description or a near parent says so. */
  private static boolean looksLikeSearch(AccessibilityNodeInfo box) {
    AccessibilityNodeInfo n = box;
    for (int i = 0; i < 4 && n != null; i++) {
      StringBuilder words = new StringBuilder();
      if (Build.VERSION.SDK_INT >= 26 && n.getHintText() != null) words.append(n.getHintText()).append(' ');
      if (n.getViewIdResourceName() != null) words.append(n.getViewIdResourceName()).append(' ');
      if (n.getContentDescription() != null) words.append(n.getContentDescription()).append(' ');
      if (n.getClassName() != null) words.append(n.getClassName()).append(' ');
      if (ControlState.searchy(words.toString())) return true;
      n = n.getParent();
    }
    return false;
  }

  // ---- a picture of the screen ------------------------------------------------

  /** A JPEG of the screen (≤1024 px), base64 — Android 11+. Apps with copy
   *  protection (Netflix's video…) refuse: "protected". */
  static void snapshot(Consumer<String> done, Consumer<String> fail) {
    IzukiAccessibilityService service = active;
    if (service == null) { fail.accept("off"); return; }
    if (Build.VERSION.SDK_INT < 30) { fail.accept("old"); return; }
    service.shoot(done, fail);
  }

  @RequiresApi(30)
  private void shoot(Consumer<String> done, Consumer<String> fail) {
    takeScreenshot(Display.DEFAULT_DISPLAY, getMainExecutor(), new TakeScreenshotCallback() {
      @Override public void onSuccess(ScreenshotResult r) {
        try {
          Bitmap hw = Bitmap.wrapHardwareBuffer(r.getHardwareBuffer(), r.getColorSpace());
          if (hw == null) { fail.accept("failed"); return; }
          Bitmap bmp = hw.copy(Bitmap.Config.ARGB_8888, false);
          r.getHardwareBuffer().close();
          int w = bmp.getWidth(), h = bmp.getHeight();
          float k = Math.min(1f, 1024f / Math.max(w, h));
          Bitmap small = k < 1f ? Bitmap.createScaledBitmap(bmp, Math.round(w * k), Math.round(h * k), true) : bmp;
          ByteArrayOutputStream out = new ByteArrayOutputStream();
          small.compress(Bitmap.CompressFormat.JPEG, 72, out);
          done.accept(Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP));
        } catch (Exception e) {
          fail.accept("failed");
        }
      }
      @Override public void onFailure(int code) {
        fail.accept(code == ERROR_TAKE_SCREENSHOT_SECURE_WINDOW ? "protected" : code == ERROR_TAKE_SCREENSHOT_INTERVAL_TIME_SHORT ? "busy" : "failed");
      }
    });
  }

  // ---- the paywall guard ----------------------------------------------------------

  static final String PREFS = "izuki";
  static volatile boolean watching = false;

  static void watch(Context c, boolean on) {
    watching = on;
    c.getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean("watch", on).apply();
  }

  private static final String[] PAYWALL = {
    "start free trial", "start your free trial", "free trial", "choose a plan", "choose your plan", "select a plan", "select your plan",
    "plans start", "subscribe to watch", "subscribe to continue", "subscribe now", "subscription required", "requires a subscription",
    "sign up to watch", "join now", "upgrade to premium", "upgrade now", "get premium", "rent for", "buy for", "rent hd", "buy hd",
    "unlock with", "become a member", "start membership", "add this channel to your subscription",
  };
  private static final Pattern PRICE = Pattern.compile("(\\$|£|€|₦|₹)\\s?\\d+([.,]\\d{2})?\\s*(/|per|a|every)?\\s*(mo|month|yr|year|week)\\b", Pattern.CASE_INSENSITIVE);
  private static final String[] FREE = { "tubi", "pluto", "roku channel", "plex", "crackle", "freevee", "kanopy", "hoopla", "pbs", "xumo", "youtube", "freestream", "vix", "filmrise", "haystack", "samsung tv plus", "lg channels", "google tv free" };
  private static final String[] PAID = { "netflix", "disney", "hulu", "max", "hbo", "prime video", "peacock", "paramount", "apple tv", "starz", "showtime", "youtube tv", "sling", "fubo", "espn", "discovery" };
  private static final Map<String, Long> told = new HashMap<>();

  private final Runnable checkPaywall = () -> {
    if (!watching) return;
    AccessibilityNodeInfo root = getRootInActiveWindow();
    if (root == null || root.getPackageName() == null) return;
    String pkg = root.getPackageName().toString();
    if (pkg.equals(getPackageName())) return;
    StringBuilder words = new StringBuilder();
    gather(root, words, 0);
    String all = words.toString().toLowerCase(Locale.ROOT);
    String hit = null;
    for (String w : PAYWALL) if (all.contains(w)) { hit = w; break; }
    if (hit == null && PRICE.matcher(all).find()) hit = "price";
    if (hit == null) return;
    Long last = told.get(pkg);
    if (last != null && System.currentTimeMillis() - last < 10 * 60 * 1000) return;
    told.put(pkg, System.currentTimeMillis());
    String app = label(pkg);
    List<String> free = freeApps(pkg);
    String say = app + " wants a subscription or payment here."
      + (free.isEmpty() ? " Tubi, Pluto TV and YouTube are free instead." : " Free on this TV: " + String.join(", ", free) + " — say “Hey Nova, open " + free.get(0) + "”.");
    orbFor("paywall", "talk", say, 10_000);
    IzukiControlPlugin.emit("paywall", app, pkg, say);
  };

  private static void gather(AccessibilityNodeInfo node, StringBuilder out, int depth) {
    if (node == null || depth > 40 || out.length() > 6000) return;
    if (!node.isVisibleToUser()) return;
    if (!node.isPassword()) {
      if (node.getText() != null) out.append(node.getText()).append(' ');
      if (node.getContentDescription() != null) out.append(node.getContentDescription()).append(' ');
    }
    for (int i = 0; i < node.getChildCount(); i++) gather(node.getChild(i), out, depth + 1);
  }

  private String label(String pkg) {
    try {
      PackageManager pm = getPackageManager();
      return pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString();
    } catch (Exception e) { return "This app"; }
  }

  /** Apps on this TV that are free to watch (not the one that asked for money). */
  private List<String> freeApps(String except) {
    List<String> out = new ArrayList<>();
    PackageManager pm = getPackageManager();
    List<ResolveInfo> all = new ArrayList<>(pm.queryIntentActivities(new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER), 0));
    all.addAll(pm.queryIntentActivities(new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER), 0));
    for (ResolveInfo r : all) {
      if (out.size() >= 3) break;
      String pkg = r.activityInfo.packageName;
      if (pkg.equals(except)) continue;
      String name = r.loadLabel(pm).toString();
      String low = name.toLowerCase(Locale.ROOT);
      boolean paid = false, free = false;
      for (String w : PAID) if (low.contains(w)) { paid = true; break; }
      if (!paid) for (String w : FREE) if (low.contains(w)) { free = true; break; }
      if (free && !out.contains(name)) out.add(name);
    }
    return out;
  }

  // ---- the little orb over other apps ----------------------------------------

  private static View orbView;
  private static WindowManager.LayoutParams orbLp;
  private static OrbDot dot;
  private static TextView caption;
  /** Who put the shared orb up (page, wake listener, Maps, a paywall). */
  private static String orbOwner;
  private static String orbState = "";
  private static String orbError = "";
  private static long orbShownAt = 0;
  private static final Handler ui = new Handler(Looper.getMainLooper());

  /**
   * Listening, thinking and talking are leases. The page renews them while
   * they are true; if the page stops (it closed, or Android ended its
   * process), the orb drops to resting instead of claiming "Listening…" or
   * "Thinking…" for ever over the home screen.
   */
  private static final Runnable leaseOver = () -> {
    if (orbView == null) return;
    if ("wake".equals(orbOwner) || "paywall".equals(orbOwner)) { orbOwner = null; removeOrbNow(); return; }
    if (!"rest".equals(orbState)) showState("rest", "");
  };
  private static final Runnable captionOff = () -> { if (caption != null) caption.setVisibility(View.GONE); };
  /** Settings can open after the page asked for the orb; take it down then. */
  private static final Runnable settingsGuard = () -> {
    IzukiAccessibilityService service = active;
    if (service == null || orbView == null || !settingsInFront(service)) return;
    orbOwner = null;
    removeOrbNow();
  };

  /** The page's own orb. Idle dismisses it; listen/think/talk are leased; rest stays. */
  static void orb(String state, String words, long leaseMs) {
    if (state == null || "idle".equals(state) || "hide".equals(state)) {
      hideOrb();
      return;
    }
    orbFor("page", state, words, leaseMs);
  }

  static void orbFor(String owner, String state, String words) {
    orbFor(owner, state, words, "rest".equals(state) ? 0 : 20_000);
  }

  /**
   * The orb is shared by the page, the wake listener, Maps and the paywall
   * watcher. An idle from one must not take down an orb another still owns —
   * stopping the wake listener used to hide the Maps orb and strand the
   * driver with no way back to Izuki.
   */
  static void orbFor(String owner, String state, String words, long leaseMs) {
    ui.post(() -> {
      IzukiAccessibilityService service = active;
      if (service == null) { orbError = "Android control is off, so the orb can't be drawn."; return; }
      if (state == null || "idle".equals(state) || "hide".equals(state)) {
        if (orbOwner == null || orbOwner.equals(owner)) {
          orbOwner = null;
          // Remove in this same UI callback. Calling hideOrb() here would
          // post a second callback, letting a newer Maps/listen acquire the
          // orb in between and then be removed by this stale release.
          removeOrbNow();
        }
        return;
      }
      // Never float Izuki's orb over Android's own Settings or permission
      // screens: that is where the person turns Accessibility on, and a
      // "Listening…" bubble there looks like Izuki is watching the setting.
      if (settingsInFront(service)) { removeOrbNow(); return; }
      orbOwner = owner;
      if (orbView == null && !addOrb(service)) return;
      showState(state, words);
      ui.removeCallbacks(settingsGuard);
      ui.postDelayed(settingsGuard, 400);
      ui.removeCallbacks(leaseOver);
      if (leaseMs > 0) ui.postDelayed(leaseOver, leaseMs);
    });
  }

  private static void showState(String state, String words) {
    if (dot == null || caption == null) return;
    orbState = state;
    dot.setState(state);
    String shown = words != null && !words.isEmpty() ? words
      : "listen".equals(state) ? "Listening…" : "think".equals(state) ? "Working…" : "";
    caption.setText(shown);
    caption.setVisibility(shown.isEmpty() ? View.GONE : View.VISIBLE);
    ui.removeCallbacks(captionOff);
    // A resting orb's words are a hint, not a status: they fade after a moment.
    if ("rest".equals(state) && !shown.isEmpty()) ui.postDelayed(captionOff, 6000);
  }

  private static boolean addOrb(IzukiAccessibilityService service) {
    WindowManager wm = (WindowManager) service.getSystemService(WINDOW_SERVICE);
    LinearLayout box = new LinearLayout(service);
    box.setOrientation(LinearLayout.HORIZONTAL);
    box.setGravity(Gravity.CENTER_VERTICAL);
    box.setPadding(dp(service, 4), dp(service, 4), dp(service, 4), dp(service, 4));
    box.setBackground(null);
    box.setContentDescription("Izuki. Tap to talk. Drag to move. Long-press to hide.");
    box.setClickable(true);
    dot = new OrbDot(service);
    box.addView(dot, new LinearLayout.LayoutParams(dp(service, 56), dp(service, 56)));
    caption = new TextView(service);
    caption.setTextColor(Color.WHITE);
    caption.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
    caption.setMaxWidth(dp(service, 220));
    caption.setMaxLines(2);
    caption.setPadding(dp(service, 10), dp(service, 6), dp(service, 12), dp(service, 6));
    android.graphics.drawable.GradientDrawable capBg = new android.graphics.drawable.GradientDrawable();
    capBg.setColor(Color.argb(210, 8, 9, 20));
    capBg.setCornerRadius(dp(service, 18));
    caption.setBackground(capBg);
    LinearLayout.LayoutParams captionLp = new LinearLayout.LayoutParams(
      LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
    captionLp.setMargins(dp(service, 8), 0, 0, 0);
    box.addView(caption, captionLp);
    WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
      WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT,
      WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
      PixelFormat.TRANSLUCENT);
    lp.gravity = Gravity.BOTTOM | Gravity.END;
    SharedPreferences prefs = service.getSharedPreferences(PREFS, MODE_PRIVATE);
    lp.x = prefs.getInt("orbX", dp(service, 16));
    // Above the navigation bar and the usual keyboard-free area by default.
    lp.y = prefs.getInt("orbY", dp(service, 120));
    box.setOnTouchListener(new OrbTouch(service, wm, lp));
    try {
      wm.addView(box, lp);
    } catch (Exception e) {
      orbError = "Android refused the orb window: " + e.getClass().getSimpleName();
      dot = null; caption = null;
      return false;
    }
    orbView = box;
    orbLp = lp;
    orbError = "";
    orbShownAt = System.currentTimeMillis();
    return true;
  }

  /**
   * Tap opens Izuki ready to listen; drag moves the orb and lets it settle on
   * the nearer side; a long press hides it until Izuki needs it again.
   */
  private static final class OrbTouch implements View.OnTouchListener {
    private final Context context;
    private final WindowManager wm;
    private final WindowManager.LayoutParams lp;
    private final int slop;
    private float downX, downY;
    private int startX, startY;
    private boolean dragging;
    private final Runnable longPress;

    OrbTouch(Context context, WindowManager wm, WindowManager.LayoutParams lp) {
      this.context = context;
      this.wm = wm;
      this.lp = lp;
      this.slop = ViewConfiguration.get(context).getScaledTouchSlop();
      this.longPress = () -> {
        dragging = true; // swallow the up
        orbOwner = null;
        removeOrbNow();
        try { Toast.makeText(context, "Orb hidden. It comes back next time Izuki needs you.", Toast.LENGTH_SHORT).show(); } catch (Exception ignored) { }
      };
    }

    @Override public boolean onTouch(View v, MotionEvent e) {
      switch (e.getActionMasked()) {
        case MotionEvent.ACTION_DOWN:
          downX = e.getRawX(); downY = e.getRawY();
          startX = lp.x; startY = lp.y;
          dragging = false;
          ui.postDelayed(longPress, ViewConfiguration.getLongPressTimeout() + 250);
          return true;
        case MotionEvent.ACTION_MOVE: {
          float dx = e.getRawX() - downX, dy = e.getRawY() - downY;
          if (!dragging && Math.hypot(dx, dy) < slop) return true;
          if (!dragging) { dragging = true; ui.removeCallbacks(longPress); }
          // Gravity is bottom-end: x grows to the left, y grows upwards.
          lp.x = Math.max(0, startX - Math.round(dx));
          lp.y = Math.max(0, startY - Math.round(dy));
          try { wm.updateViewLayout(v, lp); } catch (Exception ignored) { }
          return true;
        }
        case MotionEvent.ACTION_UP:
          ui.removeCallbacks(longPress);
          if (!dragging) { v.performClick(); openFromOrb(); return true; }
          if (orbView == null) return true; // the long press hid it
          DisplayMetrics dm = context.getResources().getDisplayMetrics();
          int edge = dp(context, 12);
          int width = v.getWidth();
          // Settle on the nearer side, inside the screen.
          lp.x = (lp.x + width / 2 > dm.widthPixels / 2) ? Math.max(edge, dm.widthPixels - width - edge) : edge;
          lp.y = Math.min(Math.max(lp.y, dp(context, 48)), Math.max(dp(context, 48), dm.heightPixels - v.getHeight() - dp(context, 48)));
          try { wm.updateViewLayout(v, lp); } catch (Exception ignored) { }
          context.getSharedPreferences(PREFS, MODE_PRIVATE).edit().putInt("orbX", lp.x).putInt("orbY", lp.y).apply();
          return true;
        case MotionEvent.ACTION_CANCEL:
          ui.removeCallbacks(longPress);
          return true;
        default:
          return false;
      }
    }
  }

  /** For the diagnostics screen and the Phone Readiness check. */
  static JSONObject orbStatus() {
    JSONObject out = new JSONObject();
    put(out, "mechanism", "accessibility-overlay");
    put(out, "windowType", "TYPE_ACCESSIBILITY_OVERLAY");
    put(out, "available", active != null);
    put(out, "showing", orbView != null);
    put(out, "owner", orbOwner == null ? "" : orbOwner);
    put(out, "state", orbView == null ? "" : orbState);
    put(out, "shownAt", orbView == null ? 0 : orbShownAt);
    put(out, "lastError", orbError);
    return out;
  }

  /**
   * Tapping the floating orb brings Izuki's page back. It does not start a
   * voice turn: tapping the orb used to fire a fake "Hey Nova" and left the
   * page listening (and the orb up) behind Android Settings. The person taps
   * the microphone when they want to talk.
   */
  private static void openFromOrb() {
    IzukiAccessibilityService service = active;
    if (service == null) return;
    hideOrb();
    Intent open = new Intent(service, MainActivity.class)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
    try { service.startActivity(open); } catch (Exception ignored) { }
  }

  private static void hideOrb() {
    ui.post(() -> {
      orbOwner = null;
      removeOrbNow();
    });
  }

  /** UI-thread removal, used by both hideOrb and the owner-checked path. */
  private static void removeOrbNow() {
    ui.removeCallbacks(leaseOver);
    ui.removeCallbacks(captionOff);
    ui.removeCallbacks(settingsGuard);
    IzukiAccessibilityService service = active;
    if (orbView != null && service != null) {
      try { ((WindowManager) service.getSystemService(WINDOW_SERVICE)).removeView(orbView); } catch (Exception ignored) { }
    }
    if (dot != null) dot.stop();
    orbView = null; orbLp = null; dot = null; caption = null; orbState = "";
  }

  private static int dp(Context c, int v) {
    return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, c.getResources().getDisplayMetrics());
  }

  /**
   * Izuki's liquid orb, the same one the PC, the phone app and the website
   * draw (docs/app/orb.js): wave-blobs of flowing colour screened together,
   * cool blue while listening, violet while thinking, pink-cyan-green while
   * talking. Three layers, so it stays cheap over other apps — and while it
   * only rests, it holds still instead of redrawing 60 times a second.
   */
  static class OrbDot extends View {
    private static final int[][] LISTEN = { { 6, 182, 212 }, { 10, 132, 255 }, { 99, 102, 241 }, { 34, 211, 238 } };
    private static final int[][] THINK = { { 147, 51, 234 }, { 79, 70, 229 }, { 219, 39, 119 }, { 124, 58, 237 } };
    private static final int[][] TALK = { { 236, 72, 153 }, { 6, 182, 212 }, { 16, 185, 129 }, { 139, 92, 246 } };
    private static final int[][] IDLE = { { 99, 102, 241 }, { 34, 211, 238 }, { 139, 92, 246 }, { 56, 189, 248 } };
    private final Paint glow = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint body = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint fill = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint edge = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint clear = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint layer = new Paint();
    private final Paint shine = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Path blob = new Path();
    private final Matrix spin = new Matrix();
    private final int[] cols = new int[5];
    private final ValueAnimator clock = ValueAnimator.ofFloat(0f, 1f);
    private String state = "listen";
    private float t = 0f;

    OrbDot(Context c) {
      super(c);
      edge.setStyle(Paint.Style.STROKE);
      // Each layer clears its own middle, then screens onto the others.
      clear.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.DST_OUT));
      layer.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SCREEN));
      clock.setDuration(100000);
      clock.setRepeatCount(ValueAnimator.INFINITE);
      clock.addUpdateListener(a -> { t = (float) a.getCurrentPlayTime() / 1000f; invalidate(); });
      clock.start();
    }

    void setState(String s) {
      state = s;
      // A resting orb is a button, not a performance: no redraw loop.
      if ("rest".equals(s)) { if (clock.isRunning() && !clock.isPaused()) clock.pause(); invalidate(); }
      else if (clock.isPaused()) clock.resume();
      else if (!clock.isStarted()) clock.start();
    }
    void stop() { clock.cancel(); }

    private static int rgba(int[] c, float a) {
      return Color.argb(Math.round(Math.max(0f, Math.min(1f, a)) * 255f), c[0], c[1], c[2]);
    }

    /** How much it moves, 0..1: a voice while talking, a soft pulse while listening. */
    private float level() {
      if ("talk".equals(state)) return 0.35f + 0.55f * (float) Math.abs(Math.sin(t * 6.6) * Math.sin(t * 2.1));
      if ("listen".equals(state)) return 0.12f + 0.2f * (float) Math.abs(Math.sin(t * 3.8) * Math.sin(t * 1.1));
      if ("think".equals(state)) return 0.22f + 0.08f * (float) Math.sin(t * 2.6);
      return 0.08f;
    }

    @Override protected void onDraw(Canvas c) {
      float w = getWidth(), h = getHeight(), cx = w / 2, cy = h / 2, half = Math.min(w, h) / 2;
      boolean think = "think".equals(state), talk = "talk".equals(state);
      int[][] pal = think ? THINK : talk ? TALK : "listen".equals(state) ? LISTEN : IDLE;
      float lvl = level();
      float r = half * 0.62f * (1 + lvl * 0.16f);
      float flow = t * (think ? 1.6f : 1 + lvl * 2.2f);
      float turn = t * ((think ? 1.3f : talk ? 0.7f : 0.45f) + lvl * 1.2f);
      glow.setShader(new RadialGradient(cx, cy, half, new int[] { rgba(pal[0], 0.42f + lvl * 0.38f), rgba(pal[0], 0f) }, null, Shader.TileMode.CLAMP));
      c.drawCircle(cx, cy, half, glow);
      // Dark glass for the colour to swim in.
      body.setShader(new RadialGradient(cx, cy + r * 0.2f, r * 1.05f, new int[] { rgba(pal[1], 0.16f), Color.argb(200, 4, 8, 22) }, null, Shader.TileMode.CLAMP));
      c.drawCircle(cx, cy, r * 0.97f, body);
      edge.setStrokeWidth(Math.max(1f, half / 40f));
      for (int k = 0; k < 3; k++) {
        float phase = k * 2.1f, amp = 0.05f + lvl * 0.2f, scale = 0.86f + k * 0.08f;
        blob.reset();
        for (int i = 0; i <= 72; i++) {
          double a = i / 72.0 * Math.PI * 2;
          double wave = Math.sin(a * 2 + flow * 1.3 + phase) * 0.5 + Math.sin(a * 3 - flow * 1.9 + phase * 1.7) * 0.35
              + Math.sin(a * 5 + flow * 2.7 - phase) * 0.25 * (0.3 + lvl * 1.4);
          float rr = r * scale * (float) (1 + amp * wave);
          float x = cx + (float) Math.cos(a) * rr, y = cy + (float) Math.sin(a) * rr;
          if (i == 0) blob.moveTo(x, y); else blob.lineTo(x, y);
        }
        blob.close();
        float ox = (float) Math.cos(flow * 0.7 + phase) * r * 0.16f, oy = (float) Math.sin(flow * 0.9 + phase) * r * 0.16f;
        for (int j = 0; j < 5; j++) cols[j] = rgba(pal[(j + k) % 4], 0.78f);
        SweepGradient sweep = new SweepGradient(cx + ox, cy + oy, cols, null);
        spin.setRotate((float) Math.toDegrees(turn * (k == 1 ? -1 : 1) * (0.8f + k * 0.25f) + phase), cx + ox, cy + oy);
        sweep.setLocalMatrix(spin);
        int saved = c.saveLayer(0, 0, w, h, layer);
        fill.setShader(sweep);
        c.drawPath(blob, fill);
        edge.setColor(rgba(pal[(k + 2) % 4], 0.35f + lvl * 0.5f));
        c.drawPath(blob, edge);
        // Clear the middle, so each layer reads as a glowing rim of liquid.
        clear.setShader(new RadialGradient(cx + ox, cy + oy, r * scale * 1.1f,
            new int[] { Color.argb(247, 0, 0, 0), Color.argb(217, 0, 0, 0), Color.argb(77, 0, 0, 0), Color.TRANSPARENT },
            new float[] { 0f, 0.6f, 0.88f, 1f }, Shader.TileMode.CLAMP));
        c.drawRect(0, 0, w, h, clear);
        c.restoreToCount(saved);
      }
      shine.setShader(new RadialGradient(cx - r * 0.38f, cy - r * 0.42f, r * 0.55f, new int[] { Color.argb(77, 255, 255, 255), Color.TRANSPARENT }, null, Shader.TileMode.CLAMP));
      c.drawCircle(cx, cy, r * 0.98f, shine);
    }
  }
}
