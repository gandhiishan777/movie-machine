'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconCircleX, IconFilm } from './icons'
import GenerateButton from './GenerateButton'

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

  if (isCreating) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="w-12 h-12 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#475569] text-sm tracking-wide">Setting up your project...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg animate-[fade-slide-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-[#475569] text-xs font-semibold tracking-[0.15em] uppercase mb-5">
          <IconFilm className="w-4 h-4" />
          AI Screenplay Studio
        </div>
        <h1 className="text-6xl font-bold tracking-tight mb-3 movie-title-glow">
          MOVIE<br />MACHINE
        </h1>
        <p className="text-[#475569] text-base">
          Describe your movie. We&apos;ll write the script.
        </p>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#0F0F23] border border-[#1E1B4B] rounded-2xl p-8 space-y-5"
      >
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-[#475569] uppercase tracking-widest mb-2">
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
            className="w-full bg-black/60 border border-[#1E1B4B] rounded-xl px-4 py-3 text-[#F8FAFC] placeholder:text-[#1E2940] focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/50 transition-colors text-base"
          />
        </div>

        <div>
          <label htmlFor="prompt" className="block text-xs font-semibold text-[#475569] uppercase tracking-widest mb-2">
            Your Idea
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A noir detective in 1940s Tokyo discovers a conspiracy reaching into the highest levels of government, forcing him to question everything he believes about justice..."
            required
            rows={5}
            className="w-full bg-black/60 border border-[#1E1B4B] rounded-xl px-4 py-3 text-[#F8FAFC] placeholder:text-[#1E2940] focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]/50 transition-colors resize-none text-sm leading-relaxed"
          />
        </div>

        {error && (
          <p className="text-[#E11D48] text-sm flex items-center gap-1.5">
            <IconCircleX className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}

        <GenerateButton />

        <p className="text-center text-[#1E2940] text-xs">
          Powered by GPT-4o + Gemini Flash · Script and storyboard generation may take a minute or two
        </p>
      </form>
    </div>
  )
}
