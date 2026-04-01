import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      scenes: {
        orderBy: { sortOrder: 'asc' },
      },
      pipelineRuns: {
        orderBy: { createdAt: 'desc' },
        include: {
          steps: {
            orderBy: { sortOrder: 'asc' },
            include: {
              assets: true,
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

  return NextResponse.json(project)
}
