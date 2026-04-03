'use client'

import { useState, useEffect, useRef } from 'react'

type AppState = 'IDLE' | 'CREATING' | 'GENERATING' | 'COMPLETED' | 'FAILED'

interface Scene {
  id: string
  title: string
  content: string
  sortOrder: number
}

interface PipelineStepData {
  id: string
  stepType: 'SCRIPT_GENERATION' | 'IMAGE_GENERATION' | 'AUDIO_GENERATION' | 'ASSEMBLY'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  sortOrder: number
  errorMessage?: string | null
}

interface Project {
  id: string
  title: string
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED'
  scenes: Scene[]
  pipelineRuns: Array<{
    id: string
    status: string
    steps: PipelineStepData[]
  }>
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconCircleX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconFilm({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  )
}

// ─── Pipeline Step Row ───────────────────────────────────────────────────────

type StepStatus = 'RUNNING' | 'LOCKED' | 'COMPLETED' | 'FAILED'

function PipelineStepRow({
  label,
  description,
  status,
}: {
  label: string
  description: string
  status: StepStatus
}) {
  const isActive = status === 'RUNNING'

  return (
    <div
      className={[
        'flex items-center gap-4 p-4 rounded-xl transition-all duration-300',
        isActive
          ? 'bg-[#E11D48]/8 border border-[#E11D48]/25'
          : 'border border-transparent opacity-40',
      ].join(' ')}
    >
      {/* Status indicator */}
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
        {status === 'RUNNING' && (
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#E11D48] border-t-transparent animate-spin" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#E11D48] pulse-ring" />
          </div>
        )}
        {status === 'LOCKED' && (
          <IconLock className="w-5 h-5 text-[#334155]" />
        )}
        {status === 'COMPLETED' && (
          <IconCheck className="w-6 h-6 text-emerald-400" />
        )}
        {status === 'FAILED' && (
          <IconCircleX className="w-6 h-6 text-[#E11D48]" />
        )}
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-[#F8FAFC] text-sm">{label}</p>
          {status === 'LOCKED' && (
            <span className="text-[10px] bg-[#1E1B4B] text-[#475569] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
              Coming soon
            </span>
          )}
          {status === 'RUNNING' && (
            <span className="text-[10px] bg-[#E11D48]/20 text-[#E11D48] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
              In progress
            </span>
          )}
        </div>
        <p className="text-[#475569] text-xs mt-0.5">{description}</p>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [appState, setAppState] = useState<AppState>('IDLE')
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState<string | null>(null)
  const userIdRef = useRef<string | null>(null)

  // ── Bootstrap anonymous user ─────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('movieMachineUserId')
    if (stored) {
      userIdRef.current = stored
      return
    }
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Viewer' }),
    })
      .then((r) => r.json())
      .then((data) => {
        userIdRef.current = data.id
        localStorage.setItem('movieMachineUserId', data.id)
      })
      .catch(console.error)
  }, [])

  // ── Poll for completion ──────────────────────────────────────────────────
  useEffect(() => {
    if (appState !== 'GENERATING' || !projectId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        const data: Project = await res.json()

        if (data.status === 'COMPLETED') {
          setProject(data)
          setAppState('COMPLETED')
          clearInterval(interval)
        } else if (data.status === 'FAILED') {
          setProject(data)
          setAppState('FAILED')
          clearInterval(interval)
        }
      } catch {
        // network blip — keep polling
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [appState, projectId])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !prompt.trim() || !userIdRef.current) return

    setAppState('CREATING')
    setError(null)

    try {
      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), prompt: prompt.trim(), userId: userIdRef.current }),
      })
      const created = await createRes.json()

      await fetch(`/api/projects/${created.id}/generate`, { method: 'POST' })

      setProjectId(created.id)
      setAppState('GENERATING')
    } catch {
      setError('Something went wrong. Please try again.')
      setAppState('IDLE')
    }
  }

  const handleRetry = async () => {
    if (!projectId) return
    setAppState('GENERATING')
    try {
      await fetch(`/api/projects/${projectId}/generate`, { method: 'POST' })
    } catch {
      setAppState('FAILED')
    }
  }

  const handleReset = () => {
    setAppState('IDLE')
    setTitle('')
    setPrompt('')
    setProjectId(null)
    setProject(null)
    setError(null)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-[#F8FAFC]">

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#E11D48]/4 blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E11D48]/20 to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">

        {/* ── IDLE — Create form ─────────────────────────────────────────── */}
        {appState === 'IDLE' && (
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
              onSubmit={handleGenerate}
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

              <button
                type="submit"
                className="w-full bg-[#E11D48] hover:bg-[#BE123C] active:bg-[#9F1239] text-white font-semibold py-4 rounded-xl transition-colors cursor-pointer text-base tracking-wide"
              >
                Generate My Movie →
              </button>

              <p className="text-center text-[#1E2940] text-xs">
                Powered by GPT-4o · Takes ~20 seconds
              </p>
            </form>
          </div>
        )}

        {/* ── CREATING — brief spinner ───────────────────────────────────── */}
        {appState === 'CREATING' && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-12 h-12 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#475569] text-sm tracking-wide">Setting up your project...</p>
          </div>
        )}

        {/* ── GENERATING — pipeline progress ────────────────────────────── */}
        {appState === 'GENERATING' && (
          <div className="w-full max-w-md">

            {/* Title */}
            <div className="text-center mb-10">
              <p className="text-[#475569] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                Now generating
              </p>
              <h2 className="text-3xl font-bold">{title}</h2>
            </div>

            {/* Steps */}
            <div className="bg-[#0F0F23] border border-[#1E1B4B] rounded-2xl p-6 space-y-2">
              <PipelineStepRow
                label="Script Generation"
                description="Writing your screenplay with GPT-4o"
                status="RUNNING"
              />
              <PipelineStepRow
                label="Image Generation"
                description="Visualising each scene"
                status="LOCKED"
              />
              <PipelineStepRow
                label="Audio Generation"
                description="Adding voice & original score"
                status="LOCKED"
              />
              <PipelineStepRow
                label="Final Assembly"
                description="Composing the finished film"
                status="LOCKED"
              />
            </div>

            <p className="text-center text-[#1E2940] text-xs mt-6">
              Sit tight — this usually takes 15–30 seconds
            </p>
          </div>
        )}

        {/* ── COMPLETED — script reveal ──────────────────────────────────── */}
        {appState === 'COMPLETED' && project && (
          <div className="w-full max-w-2xl">

            {/* Success header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-medium mb-3">
                <IconCheck className="w-4 h-4" />
                Script complete
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-1">{project.title}</h2>
              <p className="text-[#475569] text-sm">
                {project.scenes.length} scene{project.scenes.length !== 1 ? 's' : ''} written
              </p>
            </div>

            {/* Scene cards */}
            <div className="space-y-4">
              {project.scenes.map((scene, i) => (
                <div
                  key={scene.id}
                  className="bg-[#0F0F23] border border-[#1E1B4B] rounded-2xl p-6 scene-card"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 bg-[#E11D48]/15 text-[#E11D48] text-[10px] font-bold px-2 py-1 rounded-full tracking-widest uppercase mt-0.5">
                      Scene {scene.sortOrder}
                    </span>
                    <h3 className="font-semibold text-[#F8FAFC] text-base leading-snug">{scene.title}</h3>
                  </div>
                  <p className="text-[#64748B] leading-relaxed text-sm whitespace-pre-line">
                    {scene.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Reset */}
            <div className="text-center mt-10">
              <button
                onClick={handleReset}
                className="bg-[#0F0F23] hover:bg-[#1E1B4B] border border-[#1E1B4B] text-[#F8FAFC] font-medium px-8 py-3 rounded-xl transition-colors cursor-pointer text-sm"
              >
                + Write Another Movie
              </button>
            </div>
          </div>
        )}

        {/* ── FAILED — error state ───────────────────────────────────────── */}
        {appState === 'FAILED' && (
          <div className="w-full max-w-md text-center">
            <div className="bg-[#E11D48]/8 border border-[#E11D48]/25 rounded-2xl p-10 mb-6">
              <IconCircleX className="w-12 h-12 text-[#E11D48] mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Generation Failed</h2>
              <p className="text-[#475569] text-sm leading-relaxed">
                Something went wrong during script generation. Check your OpenAI API key and try again.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer text-sm"
              >
                Try Again
              </button>
              <button
                onClick={handleReset}
                className="bg-[#0F0F23] hover:bg-[#1E1B4B] border border-[#1E1B4B] text-[#F8FAFC] font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer text-sm"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
