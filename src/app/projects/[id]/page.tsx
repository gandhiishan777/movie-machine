import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { IconCheck, IconCircleX } from '@/app/components/icons'
import PipelineProgress from '@/app/components/PipelineProgress'
import SSERefresher from './SSERefresher'
import ProjectStoryboard from './ProjectStoryboard'
import StartOverButton from './StartOverButton'
import { getAssetProxyUrl } from '@/lib/storage'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      scenes: { orderBy: { sortOrder: 'asc' } },
      pipelineRuns: {
        include: {
          steps: {
            orderBy: { sortOrder: 'asc' },
            include: { assets: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!project || project.userId !== userId) notFound()

  const latestRun = project.pipelineRuns[0] ?? null
  const imageStep = latestRun?.steps.find((step) => step.stepType === 'IMAGE_GENERATION') ?? null
  const imageAssetsBySceneId = new Map(
    (imageStep?.assets ?? [])
      .filter((asset) => asset.sceneId)
      .map((asset) => [asset.sceneId!, asset])
  )
  const storyboardScenes = project.scenes.map((scene) => {
    const asset = imageAssetsBySceneId.get(scene.id)

    return {
      id: scene.id,
      sortOrder: scene.sortOrder,
      title: scene.title,
      content: scene.content,
      image: asset
        ? {
            id: asset.id,
            url: getAssetProxyUrl(asset.id),
            mimeType: asset.mimeType,
          }
        : null,
    }
  })
  const currentSceneNumber =
    imageStep?.status === 'RUNNING'
      ? Math.min((imageStep.assets.length || 0) + 1, Math.max(project.scenes.length, 1))
      : null
  const failedStep = latestRun?.steps.find((step) => step.status === 'FAILED') ?? null
  const failedStepMessage = getProjectFailureMessage(failedStep?.errorMessage ?? null)

  // Show "Start Over" in the navbar whenever the project has content worth wiping
  const showStartOver = project.status !== 'DRAFT'

  return (
    <div className="min-h-screen bg-[#0c0a09] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/20 to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-[#CA8A04]/[0.04] blur-[140px] animate-float-a" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/[0.04] blur-[120px] animate-float-b" />
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute inset-0 grain-overlay" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#44403C]/40 bg-[#0c0a09]/80 backdrop-blur-md">
        <Link
          href="/dashboard"
          className="text-xl font-black tracking-tighter bg-gradient-to-r from-[#FDE68A] via-[#CA8A04] to-[#92400e] bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-200"
        >
          Movie Machine
        </Link>
        <div className="flex items-center gap-3">
          {showStartOver && project.status !== 'FAILED' && (
            <StartOverButton projectId={project.id} />
          )}
          <UserButton />
        </div>
      </nav>

      <div className="relative z-10 px-4 py-12">

        {/* ── DRAFT / CREATING ─────────────────────────────────────────── */}
        {project.status === 'DRAFT' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#CA8A04]/15" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#CA8A04] animate-spin" />
              <div className="absolute inset-2 rounded-full border border-[#CA8A04]/10 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#CA8A04] gold-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[#CA8A04] text-[10px] font-bold tracking-[0.3em] uppercase mb-1">Initialising</p>
              <p className="text-white/35 text-sm tracking-wide">Setting up your project...</p>
            </div>
            <SSERefresher projectId={project.id} isGenerating={true} />
          </div>
        )}

        {/* ── GENERATING — pipeline progress ───────────────────────────── */}
        {project.status === 'GENERATING' && (
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex justify-center">
              <PipelineProgress
                title={project.title}
                steps={latestRun?.steps ?? []}
              />
            </div>

            {project.scenes.length > 0 && (
              <ProjectStoryboard
                title={project.title}
                status={project.status}
                scenes={storyboardScenes}
                steps={(latestRun?.steps ?? []).map((step) => ({
                  id: step.id,
                  stepType: step.stepType,
                  status: step.status,
                  errorMessage: step.errorMessage,
                }))}
                currentSceneNumber={currentSceneNumber}
              />
            )}

            <SSERefresher projectId={project.id} isGenerating={true} />
          </div>
        )}

        {/* ── COMPLETED — storyboard reveal ─────────────────────────────── */}
        {project.status === 'COMPLETED' && (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-bold mb-3 border border-emerald-500/20 rounded-full px-4 py-1.5 bg-emerald-500/5">
                <IconCheck className="w-4 h-4" />
                Storyboard complete
              </div>
              <p className="text-white/35 text-sm mt-2">
                {project.scenes.length} scene{project.scenes.length !== 1 ? 's' : ''} written and illustrated
              </p>
            </div>

            <ProjectStoryboard
              title={project.title}
              status={project.status}
              scenes={storyboardScenes}
              steps={(latestRun?.steps ?? []).map((step) => ({
                id: step.id,
                stepType: step.stepType,
                status: step.status,
                errorMessage: step.errorMessage,
              }))}
              currentSceneNumber={null}
            />

            <div className="text-center mt-10">
              <Link
                href="/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-[#CA8A04] to-[#92400e] hover:opacity-85 transition-opacity duration-200 cursor-pointer shadow-[0_0_24px_rgba(202,138,4,0.3)]"
              >
                + Write Another Movie
              </Link>
            </div>
          </div>
        )}

        {/* ── FAILED — error state ──────────────────────────────────────── */}
        {project.status === 'FAILED' && (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-[#1C1917]/60 border border-red-500/20 rounded-2xl p-8 mb-6">
                <IconCircleX className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Generation Failed</h2>
                <p className="text-white/40 text-sm leading-relaxed">
                  {failedStep?.stepType === 'IMAGE_GENERATION'
                    ? failedStepMessage
                    : 'Something went wrong during script generation. Check your API keys, then use Start Over when you are ready to regenerate.'}
                </p>
              </div>
              <div className="flex justify-center">
                <StartOverButton projectId={project.id} variant="primary" />
              </div>
            </div>

            {project.scenes.length > 0 && (
              <ProjectStoryboard
                title={project.title}
                status={project.status}
                scenes={storyboardScenes}
                steps={(latestRun?.steps ?? []).map((step) => ({
                  id: step.id,
                  stepType: step.stepType,
                  status: step.status,
                  errorMessage: step.errorMessage,
                }))}
                currentSceneNumber={currentSceneNumber}
              />
            )}
          </div>
        )}

      </div>
    </div>
  )
}

function getProjectFailureMessage(errorMessage: string | null) {
  if (!errorMessage) {
    return 'Image generation hit a problem. Your scenes are still saved. Use Start Over when you are ready to regenerate.'
  }

  const normalized = errorMessage.toLowerCase()

  if (
    normalized.includes('resource_exhausted') ||
    normalized.includes('quota') ||
    normalized.includes('429')
  ) {
    return 'Gemini image generation hit a quota or billing limit. Your scenes are saved, but frames cannot be created until quota is available.'
  }

  return 'Image generation hit a problem. Your scenes are still saved. Use Start Over when you are ready to regenerate.'
}
