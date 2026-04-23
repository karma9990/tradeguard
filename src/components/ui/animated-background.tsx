"use client"

import { MeshGradient } from "@paper-design/shaders-react"

/**
 * AnimatedBackground — réplique exacte du background 21st.dev/reuno-ui/background-paper-shaders
 * MeshGradient grayscale animé : noir aux coins, blanc organique au centre
 * Les éléments UI blancs contrastent parfaitement par-dessus
 */
export function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {/* ── Base noire ── */}
      <div className="absolute inset-0" style={{ background: "#000000" }} />

      {/* ── MeshGradient — effet exact de la démo ── */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#1a1a1a", "#3a3a3a", "#ffffff"]}
        speed={0.8}
      />

      {/* ── Vignette coins noirs (comme sur la démo) ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 35%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.82) 100%)",
        }}
      />

      {/* ── Grille trading fine ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.06 }}
      >
        <defs>
          <pattern id="gs" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
          </pattern>
          <pattern id="gl" width="220" height="220" patternUnits="userSpaceOnUse">
            <path d="M 220 0 L 0 0 0 220" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gs)" />
        <rect width="100%" height="100%" fill="url(#gl)" />
      </svg>

      {/* ── Lignes diagonales ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.02 }}
      >
        <defs>
          <pattern id="d" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
            <line x1="0" y1="0" x2="0" y2="56" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#d)" />
      </svg>

      {/* ── Cercles concentriques — haut droit ── */}
      <svg
        className="absolute"
        style={{ top: "-20%", right: "-15%", width: "65vw", height: "65vw", opacity: 0.05 }}
        viewBox="0 0 500 500"
      >
        {[60, 120, 180, 240, 300, 360].map((r, i) => (
          <circle key={i} cx="500" cy="0" r={r} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        ))}
      </svg>

      {/* ── Cercles concentriques — bas gauche ── */}
      <svg
        className="absolute"
        style={{ bottom: "-15%", left: "-8%", width: "48vw", height: "48vw", opacity: 0.04 }}
        viewBox="0 0 400 400"
      >
        {[50, 100, 150, 200, 250].map((r, i) => (
          <circle key={i} cx="0" cy="400" r={r} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        ))}
      </svg>

      {/* ── Grain noise ── */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "160px",
        }}
      />
    </div>
  )
}
