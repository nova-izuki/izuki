// The orb colour reaches every orb, and Drive mode keeps its Type button.
//
// The person's complaint: pick a colour and the orb — including the floating
// one over other apps, and the preview in Settings — kept its own colours.
// Two real causes were found and are guarded here:
//
//   1. The orb that floats over other apps is drawn in Java (OrbDot) with four
//      fixed palettes and never saw the setting; it now leans towards the
//      chosen colour in every state (rest, listening, thinking, talking).
//   2. The page's own orbs drew their palette colours into a shader, so a
//      palette-only tint would never reach glass, water, galaxy, 2D or 3D
//      faces. The colour is applied to the finished orb instead, which covers
//      every style and every state.
//
// Drive mode hid the Type button, so "Where to?" could not be answered by
// typing. The button stays (nothing opens the keyboard by itself).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

let checks = 0;
const fail = [];
function check(ok, what) {
  checks++;
  if (!ok) fail.push(what);
}

const orb = read('docs/app/orb.js');
const html = read('docs/app/index.html');
const native = read('docs/app/native.js');
const drive = read('docs/app/drive.js');
const plugin = read('android/app/src/main/java/com/novaizuki/mobile/IzukiControlPlugin.java');
const service = read('android/app/src/main/java/com/novaizuki/mobile/IzukiAccessibilityService.java');

// ---------------------------------------------------------------- the page
check(/let tint = null;/.test(orb), 'the orb holds the chosen colour');
check(/localStorage\.getItem\("izuki\.orbTint"\)/.test(orb), 'the colour is read back at startup');
check(/function tintOver\(ctx, size\)/.test(orb), 'a finish pass applies the colour');
check(/globalCompositeOperation = "color"/.test(orb), 'the hue changes and the light and shade stay');
check(/ctx\.globalAlpha = 0\.75/.test(orb), 'the colour is strong but keeps the orb readable');
check(/if \(!tint\) return;/.test(orb), "no colour chosen leaves the orb exactly as it was");
const finishCalls = (orb.match(/tintOver\(ctx, SIZE\)/g) || []).length;
check(finishCalls >= 3, `every drawing path finishes with the colour (found ${finishCalls}, wanted 3)`);
check(/return tintOver\(ctx, SIZE\);/.test(orb), 'a style that draws and returns still gets the colour');
check(/tint\(value\) \{/.test(orb), 'the page can change the colour at once');
check(/localStorage\.removeItem\("izuki\.orbTint"\)/.test(orb), 'clearing the colour is remembered');
check(/wake\(\);/.test(orb.slice(orb.indexOf('tint(value) {')), 200), 'a change redraws without waiting');

// ------------------------------------------------------------- the setting
check(/id="orb-tint"/.test(html), 'Settings has one orb colour');
check(/id="orb-tint-default"/.test(html), "there is a way back to Izuki's own colours");
check(/window\.IzukiOrb\?\.tint\?\.\(v\)/.test(html), 'the page orbs take the colour');
check(/window\.IzukiNative\?\.setOrbTint\?\.\(v\)/.test(html), 'the floating orb is told too');
check(/localStorage\.setItem\("izuki\.orbTint"/.test(orb), 'the choice is saved');
check(
  html.indexOf('setOrbTint?.(savedTint)') > 0,
  'the saved colour is pushed to the floating orb at startup, not only from Settings'
);
check(/\$\("orb-tint"\)\.oninput/.test(html), 'dragging the colour picker applies as you go');
check(html.includes('$("orb-tint-default").onclick'), 'resetting the colour is wired');

// ------------------------------------------------------------- the bridge
check(/setOrbTint\(hex\) \{/.test(native), 'the phone bridge exposes the colour');
check(/control\(\)\?\.orbTint\?\.\(\{ color:/.test(native), 'it calls the native method with the colour');
check(/public void orbTint\(PluginCall call\)/.test(plugin), 'the plugin has the method');
check(/IzukiAccessibilityService\.orbTint\(call\.getString\("color"/.test(plugin), 'the plugin hands the colour to the service');
check(/static void orbTint\(String hex\)/.test(service), 'the service accepts a hex colour');
check(/h\.matches\("\[0-9a-fA-F\]\{6\}"\)/.test(service), 'a bad value is refused, not painted');
check(/static void tintTo\(int argb\)/.test(service), 'the floating orb takes a colour');
check(/if \(last != null\) last\.postInvalidate\(\)/.test(service), 'a resting orb repaints at once');
check(/if \(tint != 0\) \{/.test(service), 'no colour keeps the original palettes');
check(/Color\.red\(tint\) \* 3 \+ r/.test(service), 'the chosen colour leads in every state');
const states = ['LISTEN', 'THINK', 'TALK', 'IDLE'].every((s) => new RegExp(`int\\[\\]\\[\\] ${s} =`).test(service));
check(states, 'all four orb states still exist and are tinted by the same funnel');
check(
  /private static int rgba\(int\[\] c, float a\) \{\r?\n\s+int r = c\[0\]/.test(service),
  'every palette colour goes through the one tinted function'
);

// --------------------------------------------------------------- drive mode
check(
  !/#live\.driving #live-type \{ display: none; \}/.test(drive),
  'Drive mode no longer hides the Type button'
);
check(/id="live-type"/.test(html), 'the Type button is still there');
check(/\#live\.driving #live-type \{ opacity: 0\.9; \}/.test(drive), 'it is visible, only quieter');
check(
  /Nothing opens the keyboard by itself at the wheel/.test(drive),
  'nothing pops the keyboard up by itself while driving'
);
const driveComment = drive.indexOf('No typing at the wheel');
check(driveComment === -1, 'the old "no typing at the wheel" rule is gone');

if (fail.length) {
  for (const f of fail) console.error('FAIL ' + f);
  console.error(`orbtint: ${fail.length} of ${checks} checks failed`);
  process.exit(1);
}
console.log(`orbtint: ${checks} checks passed`);
