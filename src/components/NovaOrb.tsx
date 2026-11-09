/**
 * Nova's little living core. Purely presentational: a glassy sphere with a
 * slow cyan → violet → magenta current, a specular highlight and a soft
 * halo. It is used where the assistant is waiting for you (the empty Chat
 * state), not as a replacement for the palm mark.
 */
export function NovaOrb({
  size = 58,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`izk-nova-orb ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="izk-nova-orb-halo" />
      <span className="izk-nova-orb-spin" />
      <span className="izk-nova-orb-sheen" />
      <span className="izk-nova-orb-spark" />
    </span>
  );
}
