/**
 * The Izuki mark: the open palm, big and unmistakable, on a gradient tile.
 * No ring, no eye framing it, no animation — the hand is the whole icon,
 * so it still reads clearly at 16px in a taskbar.
 */
export function IzukiMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const uid = `izk${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      className={className}
      aria-label="Izuki"
      role="img"
    >
      <defs>
        <linearGradient id={`${uid}-tile`} x1="0.1" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stopColor="#9B7DFF" />
          <stop offset="55%" stopColor="#4A63E8" />
          <stop offset="100%" stopColor="#181733" />
        </linearGradient>
        <linearGradient id={`${uid}-frost`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id={`${uid}-hand`} x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="28%" stopColor="#F4F7FB" />
          <stop offset="52%" stopColor="#CBD5E0" />
          <stop offset="78%" stopColor="#93A0AE" />
          <stop offset="100%" stopColor="#5B6673" />
        </linearGradient>
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-glasscap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={`${uid}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#0A0818" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0A0818" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x="72" y="72" width="880" height="880" rx="232" />
        </clipPath>
        <filter id={`${uid}-blur`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <path
          id={`${uid}-finger`}
          d="M -17,0 C -17,-44 -14,-96 -12,-126 A 12,12 0 0 1 12,-126 C 14,-96 17,-44 17,0 Z"
        />
        <path
          id={`${uid}-palm`}
          d="M -104,-6 C -104,-58 -66,-96 -2,-96 C 64,-96 104,-56 104,-4 C 104,54 84,128 34,158 C 8,174 -8,174 -34,158 C -84,128 -104,54 -104,-6 Z"
        />
      </defs>

      <rect
        x="72"
        y="72"
        width="880"
        height="880"
        rx="232"
        fill={`url(#${uid}-tile)`}
        fillOpacity="0.94"
      />

      <g clipPath={`url(#${uid}-clip)`}>
        <rect x="72" y="72" width="880" height="880" fill={`url(#${uid}-frost)`} />
        <rect x="72" y="72" width="880" height="880" fill={`url(#${uid}-floor)`} />

        <ellipse
          cx="512"
          cy="742"
          rx="150"
          ry="46"
          fill={`url(#${uid}-shadow)`}
          filter={`url(#${uid}-blur)`}
        />

        <g
          transform="translate(512 620)"
          fill={`url(#${uid}-hand)`}
          stroke="#241F3D"
          strokeOpacity="0.38"
          strokeWidth="6"
          strokeLinejoin="round"
        >
          <use href={`#${uid}-palm`} />
          <g transform="translate(-96 22) rotate(-58) scale(1.18 0.86)">
            <use href={`#${uid}-finger`} />
          </g>
          <use href={`#${uid}-finger`} transform="translate(-58 -92) rotate(-19) scale(0.86 0.72)" />
          <use href={`#${uid}-finger`} transform="translate(-21 -96) rotate(-6) scale(0.92 0.93)" />
          <use href={`#${uid}-finger`} transform="translate(15 -96) rotate(5) scale(0.92 1)" />
          <use href={`#${uid}-finger`} transform="translate(50 -90) rotate(17) scale(0.84 0.85)" />
        </g>
        <g transform="translate(512 620)" fill={`url(#${uid}-sheen)`} opacity="0.55">
          <use href={`#${uid}-palm`} />
        </g>

        <rect x="72" y="72" width="880" height="440" fill={`url(#${uid}-glasscap)`} />
        <ellipse cx="320" cy="175" rx="240" ry="100" fill="#FFFFFF" opacity="0.2" />
      </g>

      <rect
        x="75"
        y="75"
        width="874"
        height="874"
        rx="229"
        fill="none"
        stroke={`url(#${uid}-rim)`}
        strokeWidth="7"
      />
    </svg>
  );
}

/**
 * The bare glowing hand, used for the live on-screen cursor and for
 * hand-sign menus. Drawn around its own origin so callers can place it by
 * transform alone. Same tapered-finger family as the app mark, just chrome
 * instead of the mark's gradient tile — this is the hand standing in for
 * your actual cursor, so it reads as "the same Izuki," not a mascot.
 */

/** Per-finger transforms for each hand pose, applied to the shared finger path. */
const HAND_POSES = {
  // Open palm — idle, following the cursor, "here's what I'm looking at."
  open: {
    thumb: "translate(-96 22) rotate(-58) scale(1.18 0.86)",
    fingers: [
      "translate(-58 -92) rotate(-19) scale(0.86 0.72)",
      "translate(-21 -96) rotate(-6) scale(0.92 0.93)",
      "translate(15 -96) rotate(5) scale(0.92 1)",
      "translate(50 -90) rotate(17) scale(0.84 0.85)",
    ],
  },
  // One finger extended, the rest curled to knuckles — the instant of a tap.
  point: {
    thumb: "translate(-70 44) rotate(-72) scale(0.95 0.5)",
    fingers: [
      "translate(-58 -70) rotate(-19) scale(0.86 0.3)",
      "translate(-21 -76) rotate(-6) scale(0.92 0.32)",
      "translate(15 -96) rotate(3) scale(1.05 1.18)",
      "translate(50 -68) rotate(17) scale(0.84 0.28)",
    ],
  },
} as const;

export function HandGlyph({
  size = 34,
  tone = "#BFDBFF",
  className = "",
  sparkle = true,
  pose = "open",
}: {
  size?: number;
  /** Colour of the soft halo behind the hand — the hand itself is always chrome. */
  tone?: string;
  className?: string;
  sparkle?: boolean;
  /** "point" is the instant of a click — one finger out, rest curled in. */
  pose?: "open" | "point";
}) {
  const uid = `hg${Math.round(size)}${tone.replace("#", "")}`;
  const p = HAND_POSES[pose];
  return (
    <svg
      width={size}
      height={size * 1.16}
      viewBox="-80 -80 160 186"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-f`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="42%" stopColor="#E4EAF3" />
          <stop offset="72%" stopColor="#AFBBCC" />
          <stop offset="100%" stopColor="#727F91" />
        </linearGradient>
        <filter id={`${uid}-b`} x="-140%" y="-140%" width="380%" height="380%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <path
          id={`${uid}-finger`}
          d="M -17,0 C -17,-44 -14,-96 -12,-126 A 12,12 0 0 1 12,-126 C 14,-96 17,-44 17,0 Z"
        />
        <path
          id={`${uid}-palm`}
          d="M -104,-6 C -104,-58 -66,-96 -2,-96 C 64,-96 104,-56 104,-4 C 104,54 84,128 34,158 C 8,174 -8,174 -34,158 C -84,128 -104,54 -104,-6 Z"
        />
      </defs>

      {/* soft halo — a cool glow standing in for "glowing" without tinting the metal */}
      <g
        transform="translate(14 22) scale(0.46)"
        filter={`url(#${uid}-b)`}
        opacity="0.75"
        fill={tone}
      >
        <use href={`#${uid}-palm`} />
        <g transform={p.thumb}>
          <use href={`#${uid}-finger`} />
        </g>
        {p.fingers.map((t, i) => (
          <use key={i} href={`#${uid}-finger`} transform={t} />
        ))}
      </g>

      <g
        transform="translate(14 22) scale(0.46)"
        fill={`url(#${uid}-f)`}
        stroke="#1A1830"
        strokeOpacity="0.4"
        strokeWidth="6"
        strokeLinejoin="round"
      >
        <use href={`#${uid}-palm`} />
        <g transform={p.thumb}>
          <use href={`#${uid}-finger`} />
        </g>
        {p.fingers.map((t, i) => (
          <use key={i} href={`#${uid}-finger`} transform={t} />
        ))}
      </g>

      {sparkle && (
        <path
          d="M60 -58 L65 -42 L81 -37 L65 -32 L60 -16 L55 -32 L39 -37 L55 -42 Z"
          fill="#FFFFFF"
          opacity="0.92"
        />
      )}
    </svg>
  );
}
