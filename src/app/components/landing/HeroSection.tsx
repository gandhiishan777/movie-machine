'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const ease = [0.16, 1, 0.3, 1] as const

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain-overlay pt-20">
      {/* Subtle grid */}
      <div className="absolute inset-0 hero-grid" aria-hidden="true" />

      {/* Glowing orbs */}
      <div
        className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/15 blur-[130px] animate-float-a pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] rounded-full bg-[#06b6d4]/12 blur-[110px] animate-float-b pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating particle dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[
          { top: '15%', left: '10%', size: 2, delay: '0s', dur: '6s' },
          { top: '70%', left: '8%',  size: 1.5, delay: '1s', dur: '8s' },
          { top: '25%', left: '88%', size: 2, delay: '2s', dur: '7s' },
          { top: '80%', left: '85%', size: 1.5, delay: '0.5s', dur: '9s' },
          { top: '45%', left: '5%',  size: 1, delay: '3s', dur: '10s' },
          { top: '55%', left: '92%', size: 1, delay: '1.5s', dur: '7s' },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#7c3aed]/40"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size * 3}px`,
              height: `${p.size * 3}px`,
              animation: `float-a ${p.dur} ease-in-out infinite ${p.delay}`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          className="text-5xl sm:text-7xl md:text-8xl font-bold leading-[1.05] tracking-tight mb-6"
        >
          Turn your{' '}
          <span className="bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent">
            ideas
          </span>
          <br />
          into movies
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
          className="text-lg sm:text-xl text-white/55 mb-10 max-w-xl mx-auto leading-relaxed"
        >
          Write a prompt. AI generates your script, images, and soundtrack.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.4 }}
        >
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-white bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:opacity-85 transition-opacity duration-200 cursor-pointer shadow-[0_0_40px_rgba(124,58,237,0.35)]"
          >
            Start Creating
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  )
}
