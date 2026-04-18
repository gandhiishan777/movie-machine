import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { preparePipelineRun } from '@/lib/pipeline'
import { inngest } from '@/inngest/client'

export const maxDuration = 300

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { id } = await params

  const project = await prisma.project.findUnique({ where: { id } })

  if (!project || project.userId !== userId) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Delete all pipeline runs (cascade → steps → assets) and scenes, then reset status.
  // Cascade order: PipelineRun → PipelineStep → Asset (all via onDelete: Cascade in schema).
  // Scene → Asset uses onDelete: SetNull, but assets are already gone after pipeline cascade.
  await prisma.$transaction(async (tx) => {
    await tx.pipelineRun.deleteMany({ where: { projectId: id } })
    await tx.scene.deleteMany({ where: { projectId: id } })
    await tx.project.update({
      where: { id },
      data: { status: 'DRAFT' },
    })
  })

  // Fresh pipeline run: no scenes exist so SCRIPT_GENERATION will be PENDING (full regeneration).
  const pipelineRun = await preparePipelineRun(id)

  await inngest.send({
    id: pipelineRun.id,
    name: 'pipeline/execute',
    data: { runId: pipelineRun.id },
  })

  return NextResponse.json(pipelineRun, { status: 202 })
}
