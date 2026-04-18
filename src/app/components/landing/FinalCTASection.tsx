'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

export default function FinalCTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative pt-0 pb-32 px-4 bg-[#0c0a09] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#CA8A04]/[0.07] blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-2xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative text-center px-8 py-16 rounded-3xl border border-[#CA8A04]/25 bg-gradient-to-b from-[#1C1917]/80 to-[#0c0a09]/80 overflow-hidden backdrop-blur-sm"
          style={{
            boxShadow: '0 0 80px rgba(202,138,4,0.12), 0 0 160px rgba(202,138,4,0.05), inset 0 1px 0 rgba(202,138,4,0.08)',
          }}
        >
          {/* Gold corner accents */}
          <div className="absolute top-0 left-0 w-24 h-px bg-gradient-to-r from-[#CA8A04]/80 to-transparent" />
          <div className="absolute top-0 left-0 w-px h-24 bg-gradient-to-b from-[#CA8A04]/80 to-transparent" />
          <div className="absolute bottom-0 right-0 w-24 h-px bg-gradient-to-l from-[#CA8A04]/80 to-transparent" />
          <div className="absolute bottom-0 right-0 w-px h-24 bg-gradient-to-t from-[#CA8A04]/80 to-transparent" />
          <div className="absolute top-0 right-0 w-12 h-px bg-gradient-to-l from-[#CA8A04]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-12 h-px bg-gradient-to-r from-[#CA8A04]/30 to-transparent" />

          {/* Scanlines overlay */}
          <div className="absolute inset-0 scanlines pointer-events-none" />

          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#CA8A04]/[0.08] blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6 border border-[#CA8A04]/20 rounded-full px-4 py-1.5 bg-[#CA8A04]/5 text-[#CA8A04]/70 text-[10px] font-bold tracking-[0.2em] uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04] gold-pulse" />
              Get started today
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
              Ready to make
              <br />
              <span className="bg-gradient-to-br from-[#FDE68A] via-[#CA8A04] to-[#92400e] bg-clip-text text-transparent movie-title-glow">
                your movie?
              </span>
            </h2>

            <p className="text-white/40 text-base mb-10 max-w-sm mx-auto leading-relaxed">
              Join creators turning their stories into cinematic experiences with AI.
            </p>

            <Link
              href="/sign-in"
              className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-sm text-white overflow-hidden cursor-pointer uppercase tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #CA8A04 0%, #92400e 50%, #CA8A04 100%)',
                backgroundSize: '200% 100%',
                boxShadow: '0 0 40px rgba(202,138,4,0.4), 0 0 80px rgba(202,138,4,0.15)',
              }}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">Get Started Free</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="relative z-10 w-4 h-4" aria-hidden="true">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <p className="text-center text-white/15 text-xs mt-12 tracking-widest uppercase font-bold">
        Movie Machine &mdash; Powered by AI
      </p>
    </section>
  )
}
