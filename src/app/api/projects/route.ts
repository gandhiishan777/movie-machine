import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await request.json()
  const { title, prompt } = body

  if (!title || !prompt) {
    return NextResponse.json(
      { error: 'title and prompt are required' },
      { status: 400 }
    )
  }

  const project = await prisma.project.create({
    data: {
      title,
      prompt,
      userId,
    },
  })

  return NextResponse.json(project, { status: 201 })
}


export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(projects)
}