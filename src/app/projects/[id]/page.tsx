import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { IconCheck, IconCircleX } from '@/app/components/icons'
import PipelineProgress from '@/app/components/PipelineProgress'
import SSERefresher from './SSERefresher'
import FailedProjectActions from './FailedProjectActions'
import ProjectStoryboard from './ProjectStoryboard'
import { getAssetProxyUrl } from '@/lib/storage'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  if (!project) notFound()

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

  return (
    <div className="min-h-screen bg-black text-[#F8FAFC]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#E11D48]/4 blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E11D48]/20 to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">

        {/* ── DRAFT / CREATING ─────────────────────────────────────────── */}
        {project.status === 'DRAFT' && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-12 h-12 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#475569] text-sm tracking-wide">Setting up your project...</p>
            <SSERefresher projectId={project.id} isGenerating={true} />
          </div>
        )}

        {/* ── GENERATING — pipeline progress ───────────────────────────── */}
        {project.status === 'GENERATING' && (
          <div className="w-full space-y-8">
            <div className="mx-auto">
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
          <div className="w-full space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-medium mb-3">
                <IconCheck className="w-4 h-4" />
                Storyboard complete
              </div>
              <p className="text-[#475569] text-sm">
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
                href="/"
                className="bg-[#0F0F23] hover:bg-[#1E1B4B] border border-[#1E1B4B] text-[#F8FAFC] font-medium px-8 py-3 rounded-xl transition-colors text-sm inline-block"
              >
                + Write Another Movie
              </Link>
            </div>
          </div>
        )}

        {/* ── FAILED — error state ──────────────────────────────────────── */}
        {project.status === 'FAILED' && (
          <div className="w-full space-y-8">
            <div className="w-full max-w-2xl mx-auto text-center">
              <div className="bg-[#E11D48]/8 border border-[#E11D48]/25 rounded-2xl p-8 mb-6">
                <IconCircleX className="w-12 h-12 text-[#E11D48] mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Generation Failed</h2>
                <p className="text-[#475569] text-sm leading-relaxed">
                  {failedStep?.stepType === 'IMAGE_GENERATION'
                    ? failedStepMessage
                    : 'Something went wrong during script generation. Check your API keys and try again.'}
                </p>
              </div>
              <FailedProjectActions projectId={project.id} />
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
    return 'Image generation hit a problem. Your scenes are still saved and you can retry from the visual stage.'
  }

  const normalized = errorMessage.toLowerCase()

  if (
    normalized.includes('resource_exhausted') ||
    normalized.includes('quota') ||
    normalized.includes('429')
  ) {
    return 'Gemini image generation hit a quota or billing limit. Your scenes are saved, but frames cannot be created until quota is available.'
  }

  return 'Image generation hit a problem. Your scenes are still saved and you can retry from the visual stage.'
}
