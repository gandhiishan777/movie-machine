'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const ease = [0.16, 1, 0.3, 1] as const

export default function FinalCTASection() {
  return (
    <section className="py-32 px-4 bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease }}
          className="relative text-center px-8 py-16 rounded-3xl border border-[#7c3aed]/30 bg-gradient-to-b from-[#7c3aed]/[0.08] to-[#06b6d4]/[0.04] overflow-hidden"
          style={{
            boxShadow:
              '0 0 80px rgba(124,58,237,0.12), 0 0 160px rgba(6,182,212,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Corner accent lines */}
          <div className="absolute top-0 left-0 w-20 h-px bg-gradient-to-r from-[#7c3aed] to-transparent" aria-hidden="true" />
          <div className="absolute top-0 left-0 w-px h-20 bg-gradient-to-b from-[#7c3aed] to-transparent" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-20 h-px bg-gradient-to-l from-[#06b6d4] to-transparent" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-px h-20 bg-gradient-to-t from-[#06b6d4] to-transparent" aria-hidden="true" />

          {/* Glow blob */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#7c3aed]/10 blur-[80px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <p className="text-[#a855f7] font-medium text-sm tracking-widest uppercase mb-5">
              Get started today
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to make
              <br />
              your movie?
            </h2>
            <p className="text-white/50 text-base mb-10 max-w-sm mx-auto leading-relaxed">
              Join creators turning their stories into cinematic experiences with AI.
            </p>

            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-white bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:opacity-85 transition-opacity duration-200 cursor-pointer shadow-[0_0_40px_rgba(124,58,237,0.3)]"
            >
              Get Started Free
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
          </div>
        </motion.div>
      </div>

      {/* Footer note */}
      <p className="text-center text-white/20 text-sm mt-12">
        Movie Machine &mdash; Powered by AI
      </p>
    </section>
  )
}
