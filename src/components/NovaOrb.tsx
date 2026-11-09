import { SphereCanvas } from "./VoiceSphere";
import { faceFor } from "../lib/faces";
import { useIzuki } from "../lib/store";

/**
 * The IZUKI orb in the Chat welcome.
 *
 * This is the same living sphere the desktop overlay uses, not a separate
 * decorative CSS imitation. It follows the user's chosen orb style and
 * motion setting, so changing the orb in Settings is reflected here too.
 */
export function NovaOrb({
  size = 58,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const settings = useIzuki((s) => s.settings);
  // A full-body buddy is not an orb; keep the chat avatar spherical instead
  // of handing SphereCanvas a style it cannot render.
  const style = settings.orb_style && !settings.orb_style.startsWith("buddy:")
    ? settings.orb_style
    : "liquid";
  return (
    <span
      className={`izk-nova-orb ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <SphereCanvas
        state="listening"
        demo={false}
        size={size}
        style={style}
        response={settings.orb_response ?? 1}
        face={faceFor(settings)}
      />
    </span>
  );
}
