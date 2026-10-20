# Izuki 1.0.150: Izuki's character moves like someone, not a picture

## 🚶 A character with weight
**The problem:** Izuki's character played its painted poses well, but the body between them was stiff:
- It started and stopped walking at full speed.
- It flipped round in a single frame.
- It stood perfectly still between gestures.
- When it changed gesture, the arms "ghosted" from one pose to the next.

Those few things are what make a drawn character read as a cut-out.

**What changed:** the same paintings now move with a body behind them.
- **Walking eases in and out.** It speeds up over the first steps and slows over the last stretch before it points at what it's about to click.
- **It turns round like a drawn character does:** walking one way, it faces you for a moment, then walks the other way, instead of flipping in a single frame.
- **It leans a touch into the walk,** and while it stands it slowly shifts its weight from one side to the other.
- **It nods a little with its own voice** while it talks.
- **It settles into each new gesture** with a tiny give and recover, so pose changes land instead of ghosting.

All of it is small (a couple of degrees, a couple of percent), so it reads as life, not wobble. It shows wherever the character does: on the desktop and in the Island.

**Respects your settings:** with Windows' "Animation effects" turned off (Settings → Accessibility → Visual effects), the extra movement stays off. The pixel-art style keeps its crisp look too.

**How it was checked:**
- A headless run of the character for ten seconds: idle, a walk with a turn halfway, talking, and idle again.
- The turn takes a quarter of a second, facing you for about a tenth.
- A render of the real painted character at each moment (walk, turn, talk, idle) looks right, with no squeezed or stretched picture.
- The walk leans about 2°.
- Breathing, sway and the voice nod stay within 2%.
- No errors.
- Type check passes.

**Limits:** this uses the character's existing paintings, so it can't add new poses or a real 3D turn. Those need new art.
