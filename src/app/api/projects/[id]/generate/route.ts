import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { executePipeline } from '@/lib/pipeline'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Verify the project exists
  const project = await prisma.project.findUnique({
    where: { id },
  })

  if (!project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }

  // Create the pipeline run with all four steps in a single transaction
  const pipelineRun = await prisma.$transaction(async (tx) => {
    const run = await tx.pipelineRun.create({
      data: {
        projectId: id,
        status: 'RUNNING',
      },
    })

    await tx.pipelineStep.createMany({
      data: [
        { pipelineRunId: run.id, stepType: 'SCRIPT_GENERATION', sortOrder: 1, status: 'PENDING' },
        { pipelineRunId: run.id, stepType: 'IMAGE_GENERATION', sortOrder: 2, status: 'PENDING' },
        { pipelineRunId: run.id, stepType: 'AUDIO_GENERATION', sortOrder: 3, status: 'PENDING' },
        { pipelineRunId: run.id, stepType: 'ASSEMBLY', sortOrder: 4, status: 'PENDING' },
      ],
    })

    // Update project status
    await tx.project.update({
      where: { id },
      data: { status: 'GENERATING' },
    })

    // Return the run with its steps
    return tx.pipelineRun.findUnique({
      where: { id: run.id },
      include: { steps: true },
    })
  })
  // Fire and forget — don't await
  executePipeline(pipelineRun!.id, id, project.prompt)

  return NextResponse.json(pipelineRun, { status: 201 })
}
