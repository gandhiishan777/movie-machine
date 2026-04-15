'use client'

import { motion } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1] as const

const steps = [
  {
    number: '01',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-[#a855f7]"
        aria-hidden="true"
      >
        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        <path d="M19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    title: 'Write a prompt',
    description:
      'Describe your story in a few words — genre, mood, characters. That\'s all it takes to get started.',
  },
  {
    number: '02',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-[#06b6d4]"
        aria-hidden="true"
      >
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    title: 'AI builds your movie',
    description:
      'Our pipeline generates a full script, scene-by-scene imagery, and a custom soundtrack — automatically.',
  },
  {
    number: '03',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-[#a855f7]"
        aria-hidden="true"
      >
        <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
    title: 'Watch it come to life',
    description:
      'Browse your storyboard scene by scene. Every image, line of dialogue, and note fully assembled.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-32 px-4 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-20"
        >
          <p className="text-[#7c3aed] font-medium text-sm tracking-widest uppercase mb-4">
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            From idea to storyboard
            <br />
            in three steps
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease, delay: i * 0.15 }}
              className="relative p-8 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-[#7c3aed]/40 hover:bg-white/[0.06] transition-colors duration-300 cursor-default group"
            >
              {/* Step number watermark */}
              <span className="absolute top-5 right-6 text-5xl font-bold text-white/[0.04] group-hover:text-white/[0.07] transition-colors duration-300 select-none">
                {step.number}
              </span>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c3aed]/15 to-[#06b6d4]/15 border border-white/[0.08] flex items-center justify-center mb-6">
                {step.icon}
              </div>

              <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-white/50 leading-relaxed text-sm">{step.description}</p>

              {/* Connector line (hidden on last) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 lg:-right-4 w-6 lg:w-8 h-px bg-gradient-to-r from-[#7c3aed]/30 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
