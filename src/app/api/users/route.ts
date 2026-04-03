import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()
  const { name } = body

  const user = await prisma.user.create({
    data: {
      email: `viewer-${Date.now()}-${Math.random().toString(36).slice(2)}@movie-machine.app`,
      name: name ?? 'Viewer',
    },
  })

  return NextResponse.json(user, { status: 201 })
}
