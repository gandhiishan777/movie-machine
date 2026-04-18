'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconCheck,
  IconCircleX,
  IconExpand,
  IconImage,
  IconSparkles,
} from '@/app/components/icons'

type StoryboardScene = {
  id: string
  sortOrder: number
  title: string
  content: string
  image: {
    id: string
    url: string
    mimeType: string
  } | null
}

type StoryboardStep = {
  id: string
  stepType: 'SCRIPT_GENERATION' | 'IMAGE_GENERATION' | 'AUDIO_GENERATION' | 'ASSEMBLY'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  errorMessage?: string | null
}

type ProjectStoryboardProps = {
  title: string
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED'
  scenes: StoryboardScene[]
  steps: StoryboardStep[]
  currentSceneNumber: number | null
}

function sceneDisplayTitle(scene: { sortOrder: number; title: string }) {
  if (/^scene\s+\d+\s*:/i.test(scene.title.trim())) return scene.title
  return `Scene ${scene.sortOrder}: ${scene.title}`
}

function getSceneTone(scene: StoryboardScene) {
  const lower = `${scene.title} ${scene.content}`.toLowerCase()
  if (lower.includes('night') || lower.includes('shadow') || lower.includes('dark'))
    return 'from-[#020617] via-[#111827] to-[#3f0d20]'
  if (lower.includes('dream') || lower.includes('magic') || lower.includes('fantasy'))
    return 'from-[#1d1135] via-[#4c1d95] to-[#ec4899]'
  if (lower.includes('sun') || lower.includes('gold') || lower.includes('fire'))
    return 'from-[#451a03] via-[#9a3412] to-[#f59e0b]'
  return 'from-[#0f172a] via-[#1e1b4b] to-[#7f1d1d]'
}

function ScenePlaceholder({
  scene,
  isGenerating,
  hasFailed,
  failureMessage,
}: {
  scene: StoryboardScene
  isGenerating: boolean
  hasFailed: boolean
  failureMessage: string | null
}) {
  return (
    <div
      className={[
        'relative aspect-video overflow-hidden rounded-2xl border',
        'bg-gradient-to-br',
        getSceneTone(scene),
        hasFailed ? 'border-red-500/20' : isGenerating ? 'border-[#CA8A04]/40' : 'border-white/[0.08]',
      ].join(' ')}
    >
      {/* Shimmer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
      {isGenerating && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2.2s_linear_infinite]" />
      )}

      <div className="relative h-full flex flex-col justify-between p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/60">
            <IconImage className="h-3.5 w-3.5" />
            Scene {scene.sortOrder}
          </span>
          {hasFailed ? (
            <span className="rounded-full bg-red-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400">
              Generation failed
            </span>
          ) : isGenerating ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#CA8A04]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#CA8A04] border border-[#CA8A04]/20">
              <span className="h-2 w-2 rounded-full bg-[#CA8A04] gold-pulse" />
              Rendering
            </span>
          ) : (
            <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Waiting
            </span>
          )}
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/45">
            {hasFailed ? 'Frame Unavailable' : 'Frame Pending'}
          </p>
          <h3 className="mt-2 max-w-lg text-2xl font-bold leading-tight text-white">
            {scene.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
            {hasFailed
              ? (failureMessage ?? 'Image generation failed before this frame could be rendered.')
              : isGenerating
              ? 'The visual engine is translating this scene into a cinematic frame.'
              : 'This scene will reveal its visual treatment once generation reaches it.'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Film Strip Thumbnail ── */
function FilmThumbnail({
  scene,
  isActive,
  isCurrent,
  hasFailed,
  onClick,
}: {
  scene: StoryboardScene
  isActive: boolean
  isCurrent: boolean
  hasFailed: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={[
        'snap-center flex-shrink-0 relative w-36 sm:w-44 rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer',
        isActive
          ? 'border-[#CA8A04] shadow-[0_0_24px_rgba(202,138,4,0.5)]'
          : isCurrent
          ? 'border-[#CA8A04]/50'
          : hasFailed
          ? 'border-red-500/30 opacity-70'
          : 'border-white/10 opacity-55 hover:opacity-100 hover:border-white/25',
      ].join(' ')}
    >
      {/* Scene image or gradient placeholder */}
      {scene.image ? (
        <div className="aspect-video">
          <Image
            src={scene.image.url}
            alt={scene.title}
            width={176}
            height={99}
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`aspect-video bg-gradient-to-br ${getSceneTone(scene)} flex items-center justify-center`}>
          {isCurrent && (
            <span className="w-3 h-3 rounded-full bg-[#CA8A04] gold-pulse" />
          )}
        </div>
      )}

      {/* Scene number overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
        <p className="text-[9px] font-bold tracking-[0.15em] text-white/50 uppercase">Scene {scene.sortOrder}</p>
        <p className="text-[11px] font-semibold text-white/90 leading-tight line-clamp-1">{scene.title}</p>
      </div>

      {/* Status badge */}
      {scene.image && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500/90 flex items-center justify-center">
          <IconCheck className="w-3 h-3 text-white" />
        </div>
      )}
      {isActive && (
        <div className="absolute inset-0 border-2 border-[#CA8A04]/30 rounded-lg pointer-events-none" />
      )}
    </motion.button>
  )
}

export default function ProjectStoryboard({
  title,
  status,
  scenes,
  steps,
  currentSceneNumber,
}: ProjectStoryboardProps) {
  const runningStep     = steps.find((s) => s.status === 'RUNNING') ?? null
  const failedImageStep = steps.find((s) => s.stepType === 'IMAGE_GENERATION' && s.status === 'FAILED') ?? null
  const failedImageMessage = getImageFailureMessage(failedImageStep?.errorMessage ?? null)
  const generatedCount  = scenes.filter((s) => s.image).length
  const currentScene    = scenes.find((s) => s.sortOrder === currentSceneNumber) ?? null
  const defaultSceneId  = currentScene?.id ?? scenes[0]?.id ?? null

  const [activeSceneId, setActiveSceneId]     = useState<string | null>(defaultSceneId)
  const [hasChosenScene, setHasChosenScene]   = useState(false)
  const [lightboxSceneId, setLightboxSceneId] = useState<string | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const selectedSceneId = hasChosenScene
    ? activeSceneId
    : (currentScene?.id ?? activeSceneId ?? defaultSceneId)

  const activeScene = useMemo(
    () => scenes.find((s) => s.id === selectedSceneId) ?? scenes[0] ?? null,
    [scenes, selectedSceneId]
  )

  const lightboxScene = scenes.find((s) => s.id === lightboxSceneId) ?? null

  /* Auto-scroll strip to active scene */
  useEffect(() => {
    if (!stripRef.current || !activeScene) return
    const btn = stripRef.current.querySelector(`[data-scene-id="${activeScene.id}"]`) as HTMLElement | null
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeScene?.id])

  if (!activeScene) return null

  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#CA8A04]/20 bg-[#CA8A04]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#CA8A04]/70">
              <IconSparkles className="h-3.5 w-3.5" />
              Live Storyboard
            </div>
            <h2 className="mt-4 text-4xl font-black tracking-tight">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/40">
              Scene-by-scene visual board. Click any frame to focus it and follow generation live.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Status',        value: status },
              { label: 'Frames Ready',  value: `${generatedCount}/${scenes.length}` },
              { label: 'Now Working',   value: failedImageStep
                  ? 'Failed'
                  : runningStep?.stepType === 'IMAGE_GENERATION' && currentScene
                  ? `Scene ${currentScene.sortOrder}`
                  : (runningStep?.stepType ?? 'Ready') },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
                <p className="mt-1.5 text-xs font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Film Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mb-8 rounded-xl overflow-hidden border border-[#44403C]/40 bg-[#1C1917]/60"
        >
          {/* Perforation strip — top */}
          <div className="film-perfs-top" />

          {/* Scrollable scene thumbnails */}
          <div
            ref={stripRef}
            className="flex gap-3 overflow-x-auto scroll-snap-x scrollbar-hide px-4 py-3"
          >
            {/* Left fade */}
            <div className="pointer-events-none absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-[#1C1917] to-transparent z-10" />

            {scenes.map((scene) => {
              const isActive  = scene.id === activeScene.id
              const isCurrent = currentScene?.id === scene.id && runningStep?.stepType === 'IMAGE_GENERATION'
              return (
                <div key={scene.id} data-scene-id={scene.id}>
                  <FilmThumbnail
                    scene={scene}
                    isActive={isActive}
                    isCurrent={isCurrent}
                    hasFailed={Boolean(failedImageStep)}
                    onClick={() => {
                      setHasChosenScene(true)
                      setActiveSceneId(scene.id)
                    }}
                  />
                </div>
              )
            })}

            {/* Right fade */}
            <div className="pointer-events-none absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-[#1C1917] to-transparent z-10" />
          </div>

          {/* Perforation strip — bottom */}
          <div className="film-perfs-bottom" />

          {/* Progress overlay */}
          {generatedCount < scenes.length && scenes.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/[0.04]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#92400e] via-[#CA8A04] to-[#FDE68A]"
                initial={{ width: 0 }}
                animate={{ width: `${(generatedCount / scenes.length) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          )}
        </motion.div>

        {/* ── Focus Panel ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScene.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-[#44403C]/40 bg-[#1C1917]/60 p-5 backdrop-blur-sm"
          >
            {/* Focus header */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#CA8A04]/50">
                  Focus Scene
                </p>
                <h3 className="mt-1 text-2xl font-bold text-white">
                  {sceneDisplayTitle(activeScene)}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {activeScene.image ? (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 border border-emerald-500/20">
                    Visual ready
                  </span>
                ) : failedImageStep ? (
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-400">
                    Unavailable
                  </span>
                ) : currentScene?.id === activeScene.id && runningStep?.stepType === 'IMAGE_GENERATION' ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#CA8A04]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#CA8A04] border border-[#CA8A04]/20">
                    <span className="w-2 h-2 rounded-full bg-[#CA8A04] gold-pulse" />
                    Rendering
                  </span>
                ) : (
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                    Awaiting
                  </span>
                )}
              </div>
            </div>

            {/* Main image or placeholder */}
            {activeScene.image ? (
              <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-black">
                <Image
                  src={activeScene.image.url}
                  alt={`${activeScene.title} storyboard frame`}
                  width={1600}
                  height={900}
                  unoptimized
                  className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(12,10,9,0.7),transparent_45%)]" />
                <button
                  type="button"
                  onClick={() => setLightboxSceneId(activeScene.id)}
                  className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black/70 cursor-pointer"
                >
                  <IconExpand className="h-3.5 w-3.5" />
                  Expand
                </button>
              </div>
            ) : (
              <ScenePlaceholder
                scene={activeScene}
                isGenerating={currentScene?.id === activeScene.id && runningStep?.stepType === 'IMAGE_GENERATION'}
                hasFailed={Boolean(failedImageStep)}
                failureMessage={failedImageMessage}
              />
            )}

            {/* Script content */}
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#0c0a09]/60 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
                  Scene Writing
                </p>
                {activeScene.image ? (
                  <p className="text-xs text-[#CA8A04]/50">Visual and script aligned.</p>
                ) : failedImageStep ? (
                  <p className="text-xs text-red-400/60">Script saved · frame unavailable.</p>
                ) : (
                  <p className="text-xs text-white/25">Script ready · frame rendering...</p>
                )}
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-[#CBD5E1]/80">
                {activeScene.content}
              </p>
            </div>

            {/* Failed notice */}
            {status === 'FAILED' && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <IconCircleX className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Generation paused</p>
                    <p className="mt-1 text-sm leading-relaxed text-red-300/70">
                      {failedImageMessage ?? 'Existing scenes are preserved. Use Start Over when ready to regenerate.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxScene?.image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setLightboxSceneId(null)}
            role="presentation"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-6xl overflow-hidden rounded-2xl border border-[#CA8A04]/20 bg-[#0c0a09] shadow-[0_0_60px_rgba(202,138,4,0.15)]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#CA8A04]/50">
                    Storyboard Frame
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">
                    {sceneDisplayTitle(lightboxScene)}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxSceneId(null)}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.10] cursor-pointer"
                >
                  Close
                </button>
              </div>
              <Image
                src={lightboxScene.image.url}
                alt={`${lightboxScene.title} expanded storyboard frame`}
                width={1600}
                height={900}
                unoptimized
                className="max-h-[80vh] w-full object-contain bg-black"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function getImageFailureMessage(errorMessage: string | null) {
  if (!errorMessage) return 'Image generation failed before this frame could be rendered.'
  const n = errorMessage.toLowerCase()
  if (n.includes('resource_exhausted') || n.includes('quota') || n.includes('429')) {
    return 'Gemini hit a quota limit before this frame could be rendered. Add quota or wait for the limit to reset, then use Start Over.'
  }
  return 'Image generation failed before this frame could be rendered.'
}
