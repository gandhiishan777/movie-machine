import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()
  
  const { title, prompt, userId } = body

  if (!title || !prompt || !userId) {
    return NextResponse.json(
      { error: 'title, prompt, and userId are required' },
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


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'userId query parameter is required' },
      { status: 400 }
    )
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(projects)
}