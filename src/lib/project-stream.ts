import { prisma } from '@/lib/db'
import { inngest } from '@/inngest/client'
import { isPipelineStepStale } from '@/lib/pipeline'

/** Postgres NOTIFY channel; must match migration `pg_notify` channel. */
export const PROJECT_UPDATES_CHANNEL = 'mm_project_updates'

export const RUN_RECOVERY_DELAY_MS = 15_000
/** Safety tick while LISTEN is active (stale RUNNING with no writes). */
export const LISTEN_FALLBACK_INTERVAL_MS = 15_000
/** Debounce coalesces burst NOTIFY from one transaction. */
export const NOTIFY_DEBOUNCE_MS = 50
/** Degraded path when LISTEN is unavailable. */
export const DEGRADED_POLL_INTERVAL_MS = 1_000

const projectStreamInclude = {
  scenes: { select: { id: true } },
  pipelineRuns: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: {
      steps: {
        orderBy: { sortOrder: 'asc' as const },
        include: {
          assets: {
            where: { assetType: 'IMAGE' as const },
            select: { id: true, sceneId: true },
          },
        },
      },
    },
  },
} as const

export type ProjectStreamSnapshot = NonNullable<
  Awaited<ReturnType<typeof fetchProjectStreamSnapshot>>
>

export async function fetchProjectStreamSnapshot(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: projectStreamInclude,
  })
}

export function computeStreamVersion(project: ProjectStreamSnapshot) {
  const latestRun = project.pipelineRuns[0] ?? null
  const steps =
    latestRun?.steps.map((step) => ({
      id: step.id,
      stepType: step.stepType,
      status: step.status,
      assetCount: step.assets.length,
    })) ?? []

  const version = [
    project.status,
    latestRun?.status ?? 'NO_RUN',
    project.scenes.length,
    ...steps.map((step) => `${step.stepType}:${step.status}:${step.assetCount}`),
  ].join('|')

  return { version, steps, latestRun }
}

/**
 * Re-queue pipeline execution when a run is stuck (stale RUNNING step or inconsistent state).
 * Matches previous stream route behavior.
 */
export async function maybeRecoverStalePipelineRun(project: ProjectStreamSnapshot) {
  const latestRun = project.pipelineRuns[0] ?? null
  const steps =
    latestRun?.steps.map((step) => ({
      id: step.id,
      stepType: step.stepType,
      status: step.status,
      assetCount: step.assets.length,
    })) ?? []

  const runningStep = steps.find((step) => step.status === 'RUNNING') ?? null
  const hasPendingWork = steps.some((step) => step.status === 'PENDING')
  const staleRunningStep =
    latestRun?.steps.find(
      (step) => step.status === 'RUNNING' && isPipelineStepStale(step.startedAt)
    ) ?? null
  const isRunRecoveryEligible =
    latestRun && Date.now() - latestRun.createdAt.getTime() > RUN_RECOVERY_DELAY_MS

  if (
    latestRun &&
    latestRun.status === 'RUNNING' &&
    (staleRunningStep || (!runningStep && hasPendingWork && isRunRecoveryEligible))
  ) {
    await inngest.send({
      id: latestRun.id,
      name: 'pipeline/execute',
      data: { runId: latestRun.id },
    })
  }
}

export function formatSseDataPayload(version: string, projectStatus: string) {
  return JSON.stringify({ version, projectStatus })
}

export function formatSseEvent(dataPayload: string) {
  return `data: ${dataPayload}\n\n`
}
