'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { IconCircleX, IconFilm } from './icons'
import GenerateButton from './GenerateButton'

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

export default function CreateProjectForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !prompt.trim()) return

    setIsCreating(true)
    setError(null)

    try {
      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), prompt: prompt.trim() }),
      })

      if (!createRes.ok) {
        const payload = (await createRes.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Could not create project')
      }

      const created = await createRes.json()

      const generateRes = await fetch(`/api/projects/${created.id}/generate`, { method: 'POST' })

      if (!generateRes.ok) {
        const payload = (await generateRes.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Could not start generation')
      }

      router.push(`/projects/${created.id}`)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong. Please try again.'
      )
      setIsCreating(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isCreating ? (
        <motion.div
          key="creating"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Cinematic spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#CA8A04]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#CA8A04] animate-spin" />
            <div className="absolute inset-2 rounded-full border border-[#CA8A04]/10 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#CA8A04] gold-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[#CA8A04] text-xs font-bold tracking-[0.3em] uppercase mb-1">
              Initialising
            </p>
            <p className="text-white/40 text-sm tracking-wide">Setting up your project...</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
          className="w-full max-w-lg"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-[#CA8A04]/70 text-xs font-bold tracking-[0.2em] uppercase mb-6 border border-[#CA8A04]/20 rounded-full px-4 py-1.5 bg-[#CA8A04]/5">
              <IconFilm className="w-3.5 h-3.5" />
              AI Screenplay Studio
            </div>

            <h1
              className="text-6xl sm:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-br from-[#FDE68A] via-[#CA8A04] to-[#92400e] bg-clip-text text-transparent movie-title-glow glitch-text"
              data-text="MOVIE&#10;MACHINE"
            >
              MOVIE<br />MACHINE
            </h1>

            <p className="text-white/35 text-base leading-relaxed">
              Describe your movie. We&apos;ll write the script and illustrate every scene.
            </p>
          </motion.div>

          {/* Form card */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="relative bg-[#1C1917]/80 border border-[#44403C]/60 rounded-2xl p-8 space-y-5 backdrop-blur-sm scanlines"
          >
            {/* Card gold top-line accent */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/50 to-transparent" />

            <motion.div variants={fadeUp}>
              <label htmlFor="title" className="block text-[10px] font-bold text-[#CA8A04]/60 uppercase tracking-[0.2em] mb-2">
                Movie Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Last Detective"
                required
                maxLength={120}
                className="w-full bg-[#0c0a09]/60 border border-[#44403C]/80 rounded-xl px-4 py-3 text-white placeholder:text-white/15 focus:outline-none focus:border-[#CA8A04]/60 focus:ring-1 focus:ring-[#CA8A04]/30 transition-all duration-300 text-base"
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label htmlFor="prompt" className="block text-[10px] font-bold text-[#CA8A04]/60 uppercase tracking-[0.2em] mb-2">
                Your Idea
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A noir detective in 1940s Tokyo discovers a conspiracy reaching into the highest levels of government, forcing him to question everything he believes about justice..."
                required
                rows={5}
                className="w-full bg-[#0c0a09]/60 border border-[#44403C]/80 rounded-xl px-4 py-3 text-white placeholder:text-white/15 focus:outline-none focus:border-[#CA8A04]/60 focus:ring-1 focus:ring-[#CA8A04]/30 transition-all duration-300 resize-none text-sm leading-relaxed"
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm flex items-center gap-1.5"
                >
                  <IconCircleX className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div variants={fadeUp}>
              <GenerateButton disabled={isCreating} />
            </motion.div>

            <p className="text-center text-white/15 text-xs">
              Powered by GPT-4o · Script and storyboard generation may take a minute or two
            </p>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
