'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FilmStripMarquee } from './FilmStripMarquee'

const PARTICLES = [
  { top: '12%', left: '9%',  size: 3,   delay: '0s',   dur: '7s'  },
  { top: '68%', left: '7%',  size: 2,   delay: '1.2s', dur: '9s'  },
  { top: '22%', left: '87%', size: 3,   delay: '2s',   dur: '6s'  },
  { top: '78%', left: '84%', size: 2,   delay: '0.6s', dur: '10s' },
  { top: '44%', left: '4%',  size: 1.5, delay: '3s',   dur: '8s'  },
  { top: '54%', left: '93%', size: 1.5, delay: '1.8s', dur: '7s'  },
  { top: '35%', left: '50%', size: 1,   delay: '4s',   dur: '11s' },
  { top: '88%', left: '40%', size: 1.5, delay: '2.5s', dur: '9s'  },
]

export default function HeroSection({
  marqueeSpeed = 60,
  showFilmStrip = true,
}: {
  marqueeSpeed?: number
  showFilmStrip?: boolean
}) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden grain-overlay scanlines pt-24 pb-0">
      {/* Hero grid */}
      <div className="absolute inset-0 hero-grid opacity-70" aria-hidden="true" />

      {/* Ambient orb — focused behind "MACHINE" */}
      <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[240px] rounded-full bg-[#CA8A04]/[0.18] blur-[80px] pointer-events-none" aria-hidden="true" />

      {/* Gold particle dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#CA8A04]/50"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size * 3}px`,
              height: `${p.size * 3}px`,
              animation: `float-a ${p.dur} ease-in-out infinite ${p.delay}`,
              boxShadow: `0 0 ${p.size * 4}px rgba(202,138,4,0.6)`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex-1 flex flex-col items-center justify-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 mb-8 border border-[#CA8A04]/25 rounded-full px-4 py-1.5 bg-[#CA8A04]/5 text-[#CA8A04]/70 text-xs font-bold tracking-[0.2em] uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04] gold-pulse" />
          AI Screenplay Studio
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="text-6xl sm:text-8xl md:text-9xl font-black leading-[0.95] tracking-tighter mb-6"
        >
          <span className="block text-white">MOVIE</span>
          <span
            className="block bg-gradient-to-br from-[#FDE68A] via-[#CA8A04] to-[#92400e] bg-clip-text text-transparent movie-title-glow glitch-text"
            data-text="MACHINE"
          >
            MACHINE
          </span>
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center gap-4 max-w-sm mx-auto mb-8"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#CA8A04]/30" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase">AI · Script · Vision</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#CA8A04]/30" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg sm:text-xl text-white/50 mb-10 max-w-xl mx-auto leading-relaxed"
        >
          Describe a story. Watch it become a film.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/sign-in"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base text-white overflow-hidden cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #CA8A04 0%, #92400e 50%, #CA8A04 100%)',
              backgroundSize: '200% 100%',
              boxShadow: '0 0 40px rgba(202,138,4,0.4), 0 0 80px rgba(202,138,4,0.15)',
            }}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10 tracking-widest uppercase text-sm">Start Creating</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="relative z-10 w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-full font-semibold text-sm text-white/50 hover:text-white/80 transition-colors duration-200 cursor-pointer border border-white/[0.08] hover:border-white/20"
          >
            Sign in instead →
          </Link>
        </motion.div>
      </div>

      {/* Film strip marquee pinned at bottom of hero */}
      {showFilmStrip && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.9 }}
          className="relative z-10 w-full"
        >
          <div className="flex items-center justify-between px-6 pb-2 text-[10px] font-bold tracking-[0.3em] text-white/25 uppercase font-mono">
            <span>Reel · 01 of 04</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04] gold-pulse" />
              Live from the machine
            </span>
            <span>Scroll ↓</span>
          </div>
          <FilmStripMarquee speed={marqueeSpeed} />
        </motion.div>
      )}

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0c0a09] to-transparent pointer-events-none" aria-hidden="true" />
    </section>
  )
}
