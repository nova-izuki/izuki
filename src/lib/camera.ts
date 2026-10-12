/**
 * Any camera: the built-in one, a USB webcam, a capture card or a virtual
 * camera (OBS and friends). Izuki picks the right one by itself — the one you
 * chose before if it's still plugged in, otherwise an external webcam over
 * the built-in one, and a virtual camera only when nothing else is there —
 * and moves on to the next if one won't start. You can pick another any time.
 */

export const CAMERA_KEY = "izuki.camera";

const EXTERNAL = /usb|logitech|logi |razer|elgato|anker|lifecam|insta360|obsbot|brio|c9[0-9]{2}|kiyo|emeet|aukey|nexigo|poly|jabra|owl|dslr|cam link/i;
const VIRTUAL = /virtual|obs|snap camera|xsplit|manycam|nvidia broadcast|droidcam|iriun|epoccam|camo/i;
const BUILT_IN = /integrated|built-?in|front|facetime|internal|hd webcam|ir camera/i;

export function cameraScore(label: string): number {
  if (VIRTUAL.test(label)) return 1;
  if (/\bir\b|infrared/i.test(label)) return 0; // Windows Hello's IR camera shows nothing useful
  if (EXTERNAL.test(label)) return 4;
  if (BUILT_IN.test(label)) return 2;
  return 3; // unknown names are usually plug-in webcams
}

export function savedCamera(): string | null {
  try {
    return localStorage.getItem(CAMERA_KEY);
  } catch {
    return null;
  }
}

export function saveCamera(deviceId: string) {
  try {
    localStorage.setItem(CAMERA_KEY, deviceId);
  } catch {
    /* storage is optional */
  }
}

export async function listCameras(): Promise<MediaDeviceInfo[]> {
  const md = navigator.mediaDevices;
  if (!md?.enumerateDevices) return [];
  return (await md.enumerateDevices()).filter((d) => d.kind === "videoinput");
}

/** Cameras in the order to try them. */
export function rankCameras(cams: MediaDeviceInfo[], saved: string | null): MediaDeviceInfo[] {
  return [...cams].sort((a, b) => {
    if (saved && a.deviceId === saved) return -1;
    if (saved && b.deviceId === saved) return 1;
    return cameraScore(b.label) - cameraScore(a.label);
  });
}

/**
 * Open the best camera (or `wanted`). Asks permission first if names aren't
 * visible yet, then tries cameras in order until one starts.
 */
export async function openCamera(wanted?: string | null, size: { width: number; height: number } = { width: 1280, height: 720 }): Promise<{ stream: MediaStream; deviceId: string; label: string }> {
  const md = navigator.mediaDevices;
  if (!md?.getUserMedia) throw new Error("no camera support");
  let cams = await listCameras();
  let first: MediaStream | null = null;
  // Without permission yet, the names are blank: ask once with any camera.
  if (!cams.length || cams.every((c) => !c.label)) {
    first = await md.getUserMedia({ video: { width: { ideal: size.width }, height: { ideal: size.height } }, audio: false });
    cams = await listCameras();
  }
  const order = rankCameras(cams, wanted ?? savedCamera());
  for (const cam of order) {
    // The one we already have open is the right one: keep it.
    const openId = first?.getVideoTracks()[0]?.getSettings().deviceId;
    if (first && openId === cam.deviceId) return { stream: first, deviceId: cam.deviceId, label: cam.label };
    try {
      const s = await md.getUserMedia({ video: { deviceId: { exact: cam.deviceId }, width: { ideal: size.width }, height: { ideal: size.height } }, audio: false });
      first?.getTracks().forEach((t) => t.stop());
      return { stream: s, deviceId: cam.deviceId, label: cam.label };
    } catch {
      /* busy or broken: the next one */
    }
  }
  if (first) {
    const id = first.getVideoTracks()[0]?.getSettings().deviceId ?? "";
    return { stream: first, deviceId: id, label: first.getVideoTracks()[0]?.label ?? "Camera" };
  }
  throw new Error("no camera would start");
}
