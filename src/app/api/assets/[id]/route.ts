import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { readStoredAsset } from '@/lib/storage'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const asset = await prisma.asset.findUnique({
    where: { id },
  })

  if (!asset) {
    return NextResponse.json(
      { error: 'Asset not found' },
      { status: 404 }
    )
  }

  const storedAsset = await readStoredAsset(asset.storageKey)

  return new NextResponse(Buffer.from(storedAsset.bytes), {
    headers: {
      'Content-Type': asset.mimeType || storedAsset.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
