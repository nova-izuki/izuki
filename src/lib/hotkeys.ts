/** Names accepted by the native shortcut parser, independent of keyboard layout. */
const KEY_NAMES: Record<string, string> = {
  ' ': 'Space', Spacebar: 'Space', Esc: 'Escape', Return: 'Enter',
  ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
  Backquote: 'Backquote', Minus: 'Minus', Equal: 'Equal', BracketLeft: 'BracketLeft',
  BracketRight: 'BracketRight', Backslash: 'Backslash', Semicolon: 'Semicolon',
  Quote: 'Quote', Comma: 'Comma', Period: 'Period', Slash: 'Slash',
};

type Press = Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey'>;

/** Keys that only modify another key: pressing one alone is not a shortcut. */
export const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'AltGraph', 'Unidentified', 'Dead', 'Process']);

/** A global shortcut needs a modifier, or to be an F-key on its own.
 *
 *  Windows gives a registered hotkey to Izuki *before* the app you're typing
 *  in, so a bare letter, Space or Enter saved here would stop that key
 *  working anywhere on the PC. F-keys are the one family nothing types, so
 *  they are safe alone. */
export function needsModifier(combo: string): boolean {
  if (/^F(?:[1-9]|1[0-9]|2[0-4])$/.test(combo)) return false;
  return true;
}

/** Space must be saved as "Space", and Shift+1 as "Shift+1", not "Shift+!". */
export function shortcutFromKey(event: Press): string | null {
  if (MODIFIER_KEYS.has(event.key)) return null;
  let key = KEY_NAMES[event.code] ?? KEY_NAMES[event.key];
  if (/^Key[A-Z]$/.test(event.code)) key = event.code.slice(3);
  else if (/^Digit[0-9]$/.test(event.code)) key = event.code.slice(5);
  else if (!key && /^(Space|Enter|Tab|Backspace|Delete|Insert|Home|End|PageUp|PageDown|Escape|F(?:[1-9]|1[0-9]|2[0-4]))$/.test(event.key)) key = event.key;
  else if (!key && /^[a-z0-9]$/i.test(event.key)) key = event.key.toUpperCase();
  if (!key) return null;
  const held = event.ctrlKey || event.shiftKey || event.altKey || event.metaKey;
  if (!held && needsModifier(key)) return null;
  return [event.ctrlKey && 'Ctrl', event.shiftKey && 'Shift', event.altKey && 'Alt', event.metaKey && 'Super', key].filter(Boolean).join('+');
}

/** Compare existing user spellings using the same modifier/key aliases as Rust. */
export function canonicalShortcut(combo: string): string {
  const modifiers = new Set<string>();
  let key = '';
  for (const part of combo.toLowerCase().split('+').map((p) => p.trim()).filter(Boolean)) {
    if (['ctrl', 'control', 'commandorcontrol', 'cmdorctrl'].includes(part)) modifiers.add('ctrl');
    else if (part === 'shift') modifiers.add('shift');
    else if (['alt', 'option'].includes(part)) modifiers.add('alt');
    else if (['super', 'win', 'meta', 'cmd', 'command'].includes(part)) modifiers.add('super');
    else {
      if (key) return '';
      const aliases: Record<string, string> = { esc: 'escape', return: 'enter', spacebar: 'space', del: 'delete', ins: 'insert', arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right', '`': 'backquote', ',': 'comma', '.': 'period', '/': 'slash' };
      key = aliases[part] ?? part.replace(/^key([a-z])$/, '$1').replace(/^digit([0-9])$/, '$1');
    }
  }
  return key ? [...['ctrl', 'shift', 'alt', 'super'].filter((m) => modifiers.has(m)), key].join('+') : '';
}
