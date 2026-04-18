'use client'

import { motion } from 'framer-motion'

const FILM_FRAMES = [
  { label: 'SC-01 · RAIN ON GLASS',    hue: 28, texture: 'noir'    },
  { label: 'SC-02 · NEON ALLEYWAY',    hue: 18, texture: 'city'    },
  { label: 'SC-03 · THE INFORMANT',    hue: 36, texture: 'portrait' },
  { label: 'SC-04 · TOKYO 1947',       hue: 22, texture: 'wide'    },
  { label: 'SC-05 · THE LETTER',       hue: 32, texture: 'macro'   },
  { label: 'SC-06 · CHASE / ELEVATED', hue: 14, texture: 'city'    },
  { label: 'SC-07 · SMOKE ROOM',       hue: 26, texture: 'portrait' },
  { label: 'SC-08 · FINAL CUT',        hue: 20, texture: 'wide'    },
]

type Frame = typeof FILM_FRAMES[number]

function FilmFrame({ frame, i }: { frame: Frame; i: number }) {
  const h = frame.hue
  const bg = `
    radial-gradient(ellipse at 30% 40%, oklch(0.42 0.12 ${h}) 0%, transparent 55%),
    radial-gradient(ellipse at 75% 70%, oklch(0.32 0.10 ${h + 10}) 0%, transparent 60%),
    linear-gradient(135deg, oklch(0.18 0.04 ${h}) 0%, oklch(0.10 0.03 ${h + 20}) 100%)
  `

  return (
    <div
      className="relative shrink-0 w-[280px] h-[160px] mx-1 rounded-[2px] overflow-hidden border border-[#CA8A04]/15"
      style={{ background: bg }}
    >
      <svg
        viewBox="0 0 280 160"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`vig-${i}`} cx="50%" cy="50%" r="60%">
            <stop offset="60%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {frame.texture === 'noir' && (
          <g>
            <rect x="0" y="110" width="280" height="50" fill="#000" opacity="0.55" />
            <ellipse cx="140" cy="110" rx="45" ry="58" fill="#000" opacity="0.75" />
            <circle cx="140" cy="80" r="18" fill="#000" opacity="0.85" />
          </g>
        )}
        {frame.texture === 'city' && (
          <g opacity="0.7">
            <rect x="20"  y="70" width="22" height="90"  fill="#000" />
            <rect x="50"  y="50" width="30" height="110" fill="#000" />
            <rect x="88"  y="85" width="18" height="75"  fill="#000" />
            <rect x="114" y="35" width="38" height="125" fill="#000" />
            <rect x="160" y="60" width="24" height="100" fill="#000" />
            <rect x="192" y="80" width="28" height="80"  fill="#000" />
            <rect x="228" y="55" width="32" height="105" fill="#000" />
          </g>
        )}
        {frame.texture === 'portrait' && (
          <g>
            <ellipse cx="140" cy="180" rx="70" ry="90" fill="#000" opacity="0.7" />
            <ellipse cx="140" cy="72"  rx="28" ry="34" fill="#000" opacity="0.85" />
          </g>
        )}
        {frame.texture === 'wide' && (
          <g>
            <rect x="0" y="120" width="280" height="40" fill="#000" opacity="0.6" />
            <path d="M0 120 L60 95 L120 108 L180 85 L240 100 L280 90 L280 160 L0 160 Z" fill="#000" opacity="0.55" />
          </g>
        )}
        {frame.texture === 'macro' && (
          <g>
            <rect x="60" y="40" width="160" height="100" rx="4" fill="#000" opacity="0.55" />
            <rect x="78" y="56" width="124" height="2" fill="#CA8A04" opacity="0.5" />
            <rect x="78" y="68" width="100" height="2" fill="#CA8A04" opacity="0.3" />
            <rect x="78" y="80" width="120" height="2" fill="#CA8A04" opacity="0.4" />
            <rect x="78" y="92" width="90"  height="2" fill="#CA8A04" opacity="0.3" />
          </g>
        )}

        <rect x="0" y="0" width="280" height="160" fill={`url(#vig-${i})`} />
      </svg>

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0.22) 3px)' }}
      />

      <div className="absolute top-1.5 left-2 text-[8px] font-bold tracking-[0.2em] text-[#FDE68A]/60 font-mono uppercase">
        {frame.label}
      </div>
      <div className="absolute top-1.5 right-2 text-[8px] font-bold tracking-[0.2em] text-[#FDE68A]/60 font-mono">
        {String(i + 1).padStart(2, '0')}/{String(FILM_FRAMES.length).padStart(2, '0')}
      </div>
      <div className="absolute bottom-1.5 right-2 text-[8px] font-bold tracking-[0.2em] text-[#FDE68A]/40 font-mono">
        24fps · 2.39:1
      </div>
    </div>
  )
}

export function FilmStripMarquee({ speed = 60 }: { speed?: number }) {
  const track = [...FILM_FRAMES, ...FILM_FRAMES]

  return (
    <div className="relative w-full overflow-hidden select-none" aria-hidden="true">
      <div className="film-perfs-top" />

      <div className="relative bg-[#0c0a09]">
        <div className="absolute left-0 top-0 bottom-0 w-40 z-10 pointer-events-none bg-gradient-to-r from-[#0c0a09] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-40 z-10 pointer-events-none bg-gradient-to-l from-[#0c0a09] to-transparent" />

        <motion.div
          className="flex py-4"
          style={{ width: 'max-content' }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
        >
          {track.map((f, i) => (
            <FilmFrame key={i} frame={f} i={i % FILM_FRAMES.length} />
          ))}
        </motion.div>
      </div>

      <div className="film-perfs-bottom" />
    </div>
  )
}
