import { after, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { executePipeline, isPipelineStepStale } from '@/lib/pipeline'

const RUN_RECOVERY_DELAY_MS = 15_000

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      scenes: {
        select: { id: true },
      },
      pipelineRuns: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          steps: {
            orderBy: { sortOrder: 'asc' },
            include: {
              assets: {
                where: { assetType: 'IMAGE' },
                select: { id: true, sceneId: true },
              },
            },
          },
        },
      },
    },
  })

  if (!project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }

  const latestRun = project.pipelineRuns[0] ?? null
  const steps =
    latestRun?.steps.map((step) => ({
      id: step.id,
      stepType: step.stepType,
      status: step.status,
      errorMessage: step.errorMessage,
      assetCount: step.assets.length,
    })) ?? []

  const imageStep = steps.find((step) => step.stepType === 'IMAGE_GENERATION') ?? null
  const runningStep = steps.find((step) => step.status === 'RUNNING') ?? null
  const hasPendingWork = steps.some((step) => step.status === 'PENDING')
  const staleRunningStep = latestRun?.steps.find(
    (step) => step.status === 'RUNNING' && isPipelineStepStale(step.startedAt)
  ) ?? null
  const isRunRecoveryEligible =
    latestRun &&
    Date.now() - latestRun.createdAt.getTime() > RUN_RECOVERY_DELAY_MS

  if (
    latestRun &&
    latestRun.status === 'RUNNING' &&
    (staleRunningStep || (!runningStep && hasPendingWork && isRunRecoveryEligible))
  ) {
    after(async () => {
      await executePipeline(latestRun.id)
    })
  }

  const imagesGenerated = imageStep?.assetCount ?? 0
  const currentSceneNumber =
    runningStep?.stepType === 'IMAGE_GENERATION'
      ? Math.min(imagesGenerated + 1, Math.max(project.scenes.length, 1))
      : null

  const version = [
    project.status,
    latestRun?.status ?? 'NO_RUN',
    project.scenes.length,
    ...steps.map((step) => `${step.stepType}:${step.status}:${step.assetCount}`),
  ].join('|')

  return NextResponse.json({
    projectId: project.id,
    projectStatus: project.status,
    version,
    latestRun: latestRun
      ? {
          id: latestRun.id,
          status: latestRun.status,
          steps,
        }
      : null,
    sceneSummary: {
      totalScenes: project.scenes.length,
      imagesGenerated,
      currentSceneNumber,
    },
  })
}
