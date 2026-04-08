/* ─────────────────────────────────────────
   Shared logo components
   PlateCircleLogo — used in header, auth, empty states
   PlateMascot     — used in splash screen and empty states
───────────────────────────────────────── */

/**
 * Circle logo: thick cream border, "PLATE" Nunito 900, smile arc below text.
 * circleFill: background inside the circle
 * stroke:     border + text + smile color
 */
export function PlateCircleLogo({
  size       = 80,
  circleFill = '#1A1A2E',
  stroke     = '#F5EFE2',
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle with thick border */}
      <circle cx="50" cy="50" r="44" stroke={stroke} strokeWidth="5" fill={circleFill} />

      {/* PLATE — Nunito 900, centred, slightly above middle */}
      <text
        x="50"
        y="46"
        textAnchor="middle"
        fontFamily="Nunito, sans-serif"
        fontWeight="900"
        fontSize="19"
        fill={stroke}
        letterSpacing="2"
      >PLATE</text>

      {/* Smile arc — close to letters, doesn't reach circle edges */}
      <path
        d="M 36 56 Q 50 70 64 56"
        stroke={stroke}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * Mr Line mascot — circle head (same logo inside), single-line body,
 * belly bump arc, two casual arms, two legs. stroke = #F5EFE2, width = 6.
 */
export function PlateMascot({ width = 120 }) {
  const height = width * (220 / 120)
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ── Head ── */}
      <circle cx="60" cy="36" r="30" stroke="#F5EFE2" strokeWidth="5" fill="#1A1A2E" />

      {/* PLATE inside head */}
      <text
        x="60"
        y="33"
        textAnchor="middle"
        fontFamily="Nunito, sans-serif"
        fontWeight="900"
        fontSize="11"
        fill="#F5EFE2"
        letterSpacing="0.8"
      >PLATE</text>

      {/* Smile inside head */}
      <path
        d="M 50 40 Q 60 49 70 40"
        stroke="#F5EFE2"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Body ── */}
      <line x1="60" y1="66" x2="60" y2="150" stroke="#F5EFE2" strokeWidth="6" />

      {/* ── Belly bump — short arc curving forward (right) ── */}
      <path
        d="M 60 98 Q 77 113 60 128"
        stroke="#F5EFE2"
        strokeWidth="6"
        fill="none"
      />

      {/* ── Arms — casual outward angle ── */}
      <line x1="60" y1="88" x2="103" y2="107" stroke="#F5EFE2" strokeWidth="6" />
      <line x1="60" y1="88" x2="17"  y2="107" stroke="#F5EFE2" strokeWidth="6" />

      {/* ── Legs ── */}
      <line x1="60" y1="150" x2="82"  y2="208" stroke="#F5EFE2" strokeWidth="6" />
      <line x1="60" y1="150" x2="38"  y2="208" stroke="#F5EFE2" strokeWidth="6" />
    </svg>
  )
}
