import { prisma } from './db'
import { openai } from './openai'

export async function executePipeline(runId: string, projectId: string, prompt: string) {
  try {
    // Step 1: Script Generation
    const scriptStep = await prisma.pipelineStep.findFirst({
      where: { pipelineRunId: runId, stepType: 'SCRIPT_GENERATION' },
    })

    if (!scriptStep) throw new Error('Script generation step not found')

    // Mark step as running
    await prisma.pipelineStep.update({
      where: { id: scriptStep.id },
      data: { status: 'RUNNING', startedAt: new Date() },
    })

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a screenwriter. Given a movie prompt, write a short screenplay broken into 3-5 scenes. Return your response as JSON with this exact format:
{
  "title": "Movie Title",
  "scenes": [
    { "title": "Scene 1 Title", "content": "Scene description and dialogue..." },
    { "title": "Scene 2 Title", "content": "Scene description and dialogue..." }
  ]
}
Return ONLY valid JSON, no other text.`
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = completion.choices[0].message.content
    if (!responseText) throw new Error('Empty response from OpenAI')

    const screenplay = JSON.parse(responseText)

    // Save scenes to database
    for (let i = 0; i < screenplay.scenes.length; i++) {
      await prisma.scene.create({
        data: {
          projectId,
          title: screenplay.scenes[i].title,
          content: screenplay.scenes[i].content,
          sortOrder: i + 1,
        },
      })
    }

    // Mark step as completed
    await prisma.pipelineStep.update({
      where: { id: scriptStep.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

  } catch (error) {
    // If anything fails, mark the current step and run as failed
    console.error('Pipeline execution failed:', error)

    await prisma.pipelineStep.updateMany({
      where: { pipelineRunId: runId, status: 'RUNNING' },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    await prisma.pipelineRun.update({
      where: { id: runId },
      data: { status: 'FAILED' },
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'FAILED' },
    })

    return
  }

  // If we get here, script generation succeeded
  // Mark run and project as completed (for now, since we're only running step 1)
  await prisma.pipelineRun.update({
    where: { id: runId },
    data: { status: 'COMPLETED' },
  })

  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'COMPLETED' },
  })
}