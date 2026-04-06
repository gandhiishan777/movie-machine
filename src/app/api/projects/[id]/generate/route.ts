import { after, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { executePipeline, preparePipelineRun } from '@/lib/pipeline'

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

  after(async () => {
    await executePipeline(pipelineRun.id)
  })

  return NextResponse.json(pipelineRun, { status: 202 })
}
