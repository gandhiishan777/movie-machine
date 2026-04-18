'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    number: '01',
    color: '#CA8A04',
    title: 'Write a prompt',
    description: "Describe your story in a sentence — genre, mood, characters. That's all it takes.",
    detail: 'GPT-4o · Screenplay engine',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        <path d="M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    number: '02',
    color: '#FDE68A',
    title: 'AI builds your movie',
    description: 'Full script, scene imagery, and custom soundtrack — generated automatically in one pipeline.',
    detail: 'GPT-4o · Gemini Flash · AI audio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
  {
    number: '03',
    color: '#CA8A04',
    title: 'Watch it come alive',
    description: 'Browse your storyboard scene by scene. Images, dialogue, and score — fully assembled.',
    detail: 'Interactive storyboard · Film reel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
        <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
  },
]

function StepCard({ step, index }: { step: typeof steps[number]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 56 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: index * 0.15, ease: 'easeOut' }}
      className="group relative p-8 rounded-2xl bg-[#1C1917]/60 border border-[#44403C]/50 hover:border-[#CA8A04]/40 backdrop-blur-sm transition-all duration-500 cursor-default overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, rgba(202,138,4,0.06) 0%, transparent 60%)` }} />

      {/* Top accent line on hover */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/0 to-transparent group-hover:via-[#CA8A04]/50 transition-all duration-500" />

      {/* Step number watermark */}
      <span className="absolute top-4 right-5 text-6xl font-black text-white/[0.03] group-hover:text-white/[0.06] transition-colors duration-500 select-none font-mono">
        {step.number}
      </span>

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl border flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${step.color}15, ${step.color}05)`,
          borderColor: `${step.color}30`,
          color: step.color,
        }}
      >
        {step.icon}
      </div>

      <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
      <p className="text-white/45 leading-relaxed text-sm mb-5">{step.description}</p>

      {/* Detail tag */}
      <div
        className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full border"
        style={{ color: `${step.color}80`, borderColor: `${step.color}20`, background: `${step.color}08` }}
      >
        {step.detail}
      </div>

      {/* Connector arrow (between cards) */}
      {index < steps.length - 1 && (
        <div className="hidden md:flex absolute top-1/2 -right-4 z-10 items-center justify-center w-8 h-8">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" style={{ color: '#CA8A04', opacity: 0.3 }}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </motion.div>
  )
}

export default function HowItWorksSection() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-80px' })

  return (
    <section className="relative py-32 px-4 bg-[#0c0a09] overflow-hidden">
      {/* Subtle ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#CA8A04]/15 to-transparent" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-[#CA8A04]/[0.03] blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-[#CA8A04]/70 font-bold text-[10px] tracking-[0.3em] uppercase mb-4">
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            From idea to storyboard
            <br />
            <span className="bg-gradient-to-r from-[#FDE68A] to-[#CA8A04] bg-clip-text text-transparent">
              in three steps
            </span>
          </h2>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/10 to-transparent" />
    </section>
  )
}
