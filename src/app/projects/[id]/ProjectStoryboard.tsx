'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
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

function getSceneTone(scene: StoryboardScene) {
  const lower = `${scene.title} ${scene.content}`.toLowerCase()

  if (lower.includes('night') || lower.includes('shadow') || lower.includes('dark')) {
    return 'from-[#020617] via-[#111827] to-[#3f0d20]'
  }

  if (lower.includes('dream') || lower.includes('magic') || lower.includes('fantasy')) {
    return 'from-[#1d1135] via-[#4c1d95] to-[#ec4899]'
  }

  if (lower.includes('sun') || lower.includes('gold') || lower.includes('fire')) {
    return 'from-[#451a03] via-[#9a3412] to-[#f59e0b]'
  }

  return 'from-[#0f172a] via-[#1e1b4b] to-[#7f1d1d]'
}

function ScenePlaceholder({
  scene,
  isActive,
  isGenerating,
  hasFailed,
  failureMessage,
}: {
  scene: StoryboardScene
  isActive: boolean
  isGenerating: boolean
  hasFailed: boolean
  failureMessage: string | null
}) {
  return (
    <div
      className={[
        'relative aspect-video overflow-hidden rounded-[28px] border',
        isActive ? 'border-[#E11D48]/40 shadow-[0_0_0_1px_rgba(225,29,72,0.2)]' : 'border-white/8',
        'bg-gradient-to-br',
        getSceneTone(scene),
      ].join(' ')}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.08),transparent)] animate-[shimmer_2.4s_linear_infinite]" />
      <div className="relative h-full flex flex-col justify-between p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/70">
            <IconImage className="h-3.5 w-3.5" />
            Scene {scene.sortOrder}
          </span>
          {hasFailed ? (
            <span className="rounded-full bg-[#E11D48]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FDA4AF]">
              Generation failed
            </span>
          ) : isGenerating ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E11D48]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FDA4AF]">
              <span className="h-2 w-2 rounded-full bg-[#FB7185] pulse-ring" />
              Rendering
            </span>
          ) : (
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Waiting
            </span>
          )}
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/55">
            {hasFailed ? 'Storyboard Frame Unavailable' : 'Storyboard Frame Pending'}
          </p>
          <h3 className="mt-2 max-w-lg text-2xl font-semibold leading-tight text-white">
            {scene.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
            {hasFailed
              ? failureMessage ?? 'Image generation failed before this frame could be rendered.'
              : isGenerating
              ? 'The visual engine is translating this scene into a cinematic frame.'
              : 'This scene will reveal its visual treatment once generation reaches it.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ProjectStoryboard({
  title,
  status,
  scenes,
  steps,
  currentSceneNumber,
}: ProjectStoryboardProps) {
  const runningStep = steps.find((step) => step.status === 'RUNNING') ?? null
  const failedImageStep =
    steps.find((step) => step.stepType === 'IMAGE_GENERATION' && step.status === 'FAILED') ?? null
  const failedImageMessage = getImageFailureMessage(failedImageStep?.errorMessage ?? null)
  const generatedCount = scenes.filter((scene) => scene.image).length
  const defaultSceneId =
    scenes.find((scene) => scene.sortOrder === currentSceneNumber)?.id ?? scenes[0]?.id ?? null
  const currentScene = scenes.find((scene) => scene.sortOrder === currentSceneNumber) ?? null
  const [activeSceneId, setActiveSceneId] = useState<string | null>(defaultSceneId)
  const [hasChosenScene, setHasChosenScene] = useState(false)
  const [lightboxSceneId, setLightboxSceneId] = useState<string | null>(null)
  const selectedSceneId = hasChosenScene
    ? activeSceneId
    : (currentScene?.id ?? activeSceneId ?? defaultSceneId)

  const activeScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0] ?? null,
    [scenes, selectedSceneId]
  )

  const lightboxScene =
    scenes.find((scene) => scene.id === lightboxSceneId) ?? null

  if (!activeScene) {
    return null
  }

  return (
    <>
      <div className="w-full max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
              <IconSparkles className="h-3.5 w-3.5" />
              Live Storyboard
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#94A3B8]">
              Your screenplay is now unfolding as a scene-by-scene visual board. Click any scene to focus it,
              inspect the frame, and follow the generation as new images arrive.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Project State</p>
              <p className="mt-2 text-sm font-semibold text-white">{status}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Frames Ready</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {generatedCount}/{scenes.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 col-span-2 sm:col-span-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Now Working</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {failedImageStep
                  ? 'Image generation failed'
                  : runningStep?.stepType === 'IMAGE_GENERATION' && currentScene
                  ? `Scene ${currentScene.sortOrder}`
                  : runningStep?.stepType ?? 'Storyboard ready'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Scene Rail</p>
                <p className="mt-1 text-sm text-[#94A3B8]">Jump between beats in your movie.</p>
              </div>
              <span className="rounded-full bg-[#E11D48]/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FDA4AF]">
                {generatedCount} ready
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {scenes.map((scene) => {
                const isActive = scene.id === activeScene.id
                const isCurrent = currentScene?.id === scene.id && runningStep?.stepType === 'IMAGE_GENERATION'

                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => {
                      setHasChosenScene(true)
                      setActiveSceneId(scene.id)
                    }}
                    className={[
                      'w-full rounded-2xl border px-4 py-3 text-left transition-all',
                      isActive
                        ? 'border-[#E11D48]/35 bg-[#E11D48]/10 shadow-[0_12px_40px_rgba(225,29,72,0.12)]'
                        : 'border-white/8 bg-black/20 hover:border-white/20 hover:bg-white/6',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                          Scene {scene.sortOrder}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">
                          {scene.title}
                        </p>
                      </div>

                      {scene.image ? (
                        <IconCheck className="h-5 w-5 flex-shrink-0 text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#FB7185] pulse-ring" />
                      ) : (
                        <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-white/20" />
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-[#94A3B8]">
                      {scene.image ? (
                        <>
                          <IconImage className="h-3.5 w-3.5" />
                          Frame generated
                        </>
                      ) : failedImageStep ? (
                        'Frame failed'
                      ) : isCurrent ? (
                        'Generating now'
                      ) : (
                        'Queued in storyboard'
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="space-y-5">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                    Focus Scene
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-white">
                    Scene {activeScene.sortOrder}: {activeScene.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {activeScene.image ? (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      Visual ready
                    </span>
                  ) : failedImageStep ? (
                    <span className="rounded-full bg-[#E11D48]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FDA4AF]">
                      Frame unavailable
                    </span>
                  ) : currentScene?.id === activeScene.id && runningStep?.stepType === 'IMAGE_GENERATION' ? (
                    <span className="rounded-full bg-[#E11D48]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FDA4AF]">
                      Rendering now
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                      Awaiting frame
                    </span>
                  )}
                </div>
              </div>

              {activeScene.image ? (
                <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-black">
                  <Image
                    src={activeScene.image.url}
                    alt={`${activeScene.title} storyboard frame`}
                    width={1600}
                    height={900}
                    unoptimized
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.75),transparent_45%)]" />
                  <button
                    type="button"
                    onClick={() => setLightboxSceneId(activeScene.id)}
                    className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black/60"
                  >
                    <IconExpand className="h-4 w-4" />
                    Expand frame
                  </button>
                </div>
              ) : (
                <ScenePlaceholder
                  scene={activeScene}
                  isActive
                  isGenerating={currentScene?.id === activeScene.id && runningStep?.stepType === 'IMAGE_GENERATION'}
                  hasFailed={Boolean(failedImageStep)}
                  failureMessage={failedImageMessage}
                />
              )}

              <div className="mt-5 rounded-[24px] border border-white/10 bg-[#020617]/70 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                    Scene Writing
                  </p>
                  {activeScene.image ? (
                    <p className="text-xs text-[#94A3B8]">Visual and script are now aligned.</p>
                  ) : failedImageStep ? (
                    <p className="text-xs text-[#FCA5A5]">The script is saved, but this frame was not generated.</p>
                  ) : (
                    <p className="text-xs text-[#94A3B8]">Script is ready while the frame is still rendering.</p>
                  )}
                </div>
                <p className="whitespace-pre-line text-sm leading-7 text-[#CBD5E1]">
                  {activeScene.content}
                </p>
              </div>
            </div>

            {status === 'FAILED' && (
              <div className="rounded-[28px] border border-[#E11D48]/25 bg-[#E11D48]/8 p-5">
                <div className="flex items-start gap-3">
                  <IconCircleX className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FB7185]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Generation paused</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#FDA4AF]">
                      {failedImageMessage ??
                        'Existing scenes are still preserved. Retry once the image-generation issue is resolved.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {lightboxScene?.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightboxSceneId(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-[#020617]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  Storyboard Lightbox
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Scene {lightboxScene.sortOrder}: {lightboxScene.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setLightboxSceneId(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
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
          </div>
        </div>
      )}
    </>
  )
}

function getImageFailureMessage(errorMessage: string | null) {
  if (!errorMessage) {
    return 'Image generation failed before this frame could be rendered.'
  }

  const normalized = errorMessage.toLowerCase()

  if (
    normalized.includes('resource_exhausted') ||
    normalized.includes('quota') ||
    normalized.includes('429')
  ) {
    return 'Gemini hit a quota or billing limit before this frame could be rendered. Add quota or wait for the retry window, then try again.'
  }

  return 'Image generation failed before this frame could be rendered.'
}
