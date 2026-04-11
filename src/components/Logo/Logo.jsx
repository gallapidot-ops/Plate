import './Logo.css'

/**
 * Circle logo: thick cream border, "PLATE" Nunito 900, smile arc.
 * circleFill: background inside the circle (use #E8527A to float on pink bg)
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
      <circle cx="50" cy="50" r="44" stroke={stroke} strokeWidth="5" fill={circleFill} />
      <text
        x="50" y="46"
        textAnchor="middle"
        fontFamily="Nunito, sans-serif"
        fontWeight="900"
        fontSize="19"
        fill={stroke}
        letterSpacing="2"
      >PLATE</text>
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
 * Mr Line mascot — animated:
 *  1. Full character bounces in from below
 *  2. Body has a slight landing wobble
 *  3. Right arm waves hello
 *
 * Colors: cream (#F5EFE2) on pink — head circle fill matches splash bg.
 */
export function PlateMascot({ width = 120, headFill = '#C63B2F', strokeColor = '#1A2B35' }) {
  const height = width * (210 / 120)
  return (
    <svg
      className="plate-mascot"
      width={width}
      height={height}
      viewBox="0 0 120 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ── Body group: head + torso + legs wobble together ── */}
      <g className="mascot-body-group">

        {/* Head circle */}
        <circle cx="60" cy="36" r="30" stroke={strokeColor} strokeWidth="5" fill={headFill} />
        <text
          x="60" y="33"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontWeight="900"
          fontSize="11"
          fill="#F5F0E8"
          letterSpacing="0.8"
        >PLATE</text>
        <path
          d="M 50 40 Q 60 49 70 40"
          stroke="#F5F0E8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <line x1="60" y1="66" x2="60" y2="148" stroke={strokeColor} strokeWidth="6" />

        {/* Legs */}
        <line x1="60" y1="148" x2="80" y2="202" stroke={strokeColor} strokeWidth="6" />
        <line x1="60" y1="148" x2="40" y2="202" stroke={strokeColor} strokeWidth="6" />
      </g>

      {/* ── Left arm (still) ── */}
      <line
        className="mascot-arm-left"
        x1="60" y1="88" x2="18" y2="108"
        stroke={strokeColor} strokeWidth="6"
      />

      {/* ── Right arm (waving) ── */}
      <g className="mascot-arm-wave">
        <line
          x1="60" y1="88" x2="102" y2="108"
          stroke={strokeColor} strokeWidth="6"
        />
      </g>
    </svg>
  )
}
