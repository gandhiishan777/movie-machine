import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { preparePipelineRun } from '@/lib/pipeline'
import { inngest } from '@/inngest/client'

export const maxDuration = 300

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
  })

  if (!project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }

  const pipelineRun = await preparePipelineRun(id)

  await inngest.send({
    id: pipelineRun.id,
    name: 'pipeline/execute',
    data: { runId: pipelineRun.id },
  })

  return NextResponse.json(pipelineRun, { status: 202 })
}
