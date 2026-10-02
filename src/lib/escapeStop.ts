import { api, IS_TAURI } from './ipc';
import { stopSpeaking } from './speak';
import { stopNatural } from './naturalVoice';

// The focused WebView is an independent stop path if Windows drops its
// low-level hook. Capture phase also covers text boxes and modal dialogs.
window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || event.repeat || !IS_TAURI) return;
  stopSpeaking(); stopNatural();
  void api.panic().catch(() => undefined);
}, true);
