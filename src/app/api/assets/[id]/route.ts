import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { readStoredAsset } from '@/lib/storage'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { id } = await params

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      pipelineStep: {
        include: {
          pipelineRun: {
            include: { project: { select: { userId: true } } },
          },
        },
      },
    },
  })

  if (!asset || asset.pipelineStep.pipelineRun.project.userId !== userId) {
    return NextResponse.json(
      { error: 'Asset not found' },
      { status: 404 }
    )
  }

  const storedAsset = await readStoredAsset(asset.storageKey)

  return new NextResponse(Buffer.from(storedAsset.bytes), {
    headers: {
      'Content-Type': asset.mimeType || storedAsset.contentType,
      'Cache-Control': 'private, no-store',
    },
  })
}
