import { prisma } from './db'
import { openai } from './openai'
import { buildSceneImagePrompt, generateSceneImage } from './gemini'
import { deleteStoredAsset, uploadImageAsset } from './storage'

type PipelineStepType =
  | 'SCRIPT_GENERATION'
  | 'IMAGE_GENERATION'
  | 'AUDIO_GENERATION'
  | 'ASSEMBLY'

type LoadedPipelineRun = NonNullable<Awaited<ReturnType<typeof loadPipelineRun>>>
type LoadedPipelineStep = LoadedPipelineRun['steps'][number]

type ScriptScene = {
  title: string
  content: string
}

type ScreenplayPayload = {
  title?: string
  scenes: ScriptScene[]
}

const STALE_STEP_WINDOW_MS = 10 * 60 * 1000

export async function preparePipelineRun(projectId: string) {
  const activeRun = await prisma.pipelineRun.findFirst({
    where: { projectId, status: 'RUNNING' },
    orderBy: { createdAt: 'desc' },
    include: {
      steps: {
        orderBy: { sortOrder: 'asc' },
        include: { assets: true },
      },
    },
  })

  if (activeRun) {
    return activeRun
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      scenes: {
        select: { id: true },
        take: 1,
      },
    },
  })

  if (!project) {
    throw new Error('Project not found')
  }

  const hasScenes = project.scenes.length > 0
  const now = new Date()

  try {
    return await prisma.$transaction(async (tx) => {
      const run = await tx.pipelineRun.create({
        data: {
          projectId,
          status: 'RUNNING',
        },
      })

      await tx.pipelineStep.createMany({
        data: [
          {
            pipelineRunId: run.id,
            stepType: 'SCRIPT_GENERATION',
            sortOrder: 1,
            status: hasScenes ? 'COMPLETED' : 'PENDING',
            startedAt: hasScenes ? now : null,
            completedAt: hasScenes ? now : null,
          },
          {
            pipelineRunId: run.id,
            stepType: 'IMAGE_GENERATION',
            sortOrder: 2,
            status: 'PENDING',
          },
          {
            pipelineRunId: run.id,
            stepType: 'AUDIO_GENERATION',
            sortOrder: 3,
            status: 'SKIPPED',
            startedAt: now,
            completedAt: now,
          },
          {
            pipelineRunId: run.id,
            stepType: 'ASSEMBLY',
            sortOrder: 4,
            status: 'SKIPPED',
            startedAt: now,
            completedAt: now,
          },
        ],
      })

      await tx.project.update({
        where: { id: projectId },
        data: { status: 'GENERATING' },
      })

      return tx.pipelineRun.findUniqueOrThrow({
        where: { id: run.id },
        include: {
          steps: {
            orderBy: { sortOrder: 'asc' },
            include: { assets: true },
          },
        },
      })
    })
  } catch (error) {
    const existingRun = await prisma.pipelineRun.findFirst({
      where: { projectId, status: 'RUNNING' },
      orderBy: { createdAt: 'desc' },
      include: {
        steps: {
          orderBy: { sortOrder: 'asc' },
          include: { assets: true },
        },
      },
    })

    if (existingRun) {
      return existingRun
    }

    throw error
  }
}

export async function executePipeline(runId: string) {
  const run = await loadPipelineRun(runId)

  if (!run || run.status !== 'RUNNING') {
    return
  }

  const scriptStep = getRequiredStep(run.steps, 'SCRIPT_GENERATION')
  const scriptResult = await runScriptGeneration(run, scriptStep)

  if (scriptResult !== 'completed') {
    return
  }

  const refreshedRun = await loadPipelineRun(runId)

  if (!refreshedRun || refreshedRun.status !== 'RUNNING') {
    return
  }

  const imageStep = getRequiredStep(refreshedRun.steps, 'IMAGE_GENERATION')
  const imageResult = await runImageGeneration(refreshedRun, imageStep)

  if (imageResult !== 'completed') {
    return
  }

  await finalizePipelineRunIfReady(refreshedRun.id, refreshedRun.projectId)
}

async function loadPipelineRun(runId: string) {
  return prisma.pipelineRun.findUnique({
    where: { id: runId },
    include: {
      project: {
        include: {
          scenes: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      steps: {
        orderBy: { sortOrder: 'asc' },
        include: { assets: true },
      },
    },
  })
}

function getRequiredStep<
  T extends {
    stepType: PipelineStepType
  },
>(steps: T[], stepType: PipelineStepType) {
  const step = steps.find((candidate) => candidate.stepType === stepType)

  if (!step) {
    throw new Error(`${stepType} step not found`)
  }

  return step
}

async function runScriptGeneration(
  run: LoadedPipelineRun,
  scriptStep: LoadedPipelineStep
) {
  if (scriptStep.status === 'COMPLETED' || scriptStep.status === 'SKIPPED') {
    return 'completed' as const
  }

  const claimed = await claimStep(scriptStep.id)

  if (!claimed) {
    return 'busy' as const
  }

  try {
    const screenplay = await generateScreenplay(run.project.prompt)

    await prisma.$transaction(async (tx) => {
      const existingSceneIds = await tx.scene.findMany({
        where: { projectId: run.projectId },
        select: { id: true },
      })

      if (existingSceneIds.length > 0) {
        await tx.asset.deleteMany({
          where: {
            sceneId: {
              in: existingSceneIds.map((scene) => scene.id),
            },
          },
        })
      }

      await tx.scene.deleteMany({
        where: { projectId: run.projectId },
      })

      await tx.scene.createMany({
        data: screenplay.scenes.map((scene, index) => ({
          projectId: run.projectId,
          title: scene.title,
          content: scene.content,
          sortOrder: index + 1,
        })),
      })

      await tx.pipelineStep.update({
        where: { id: scriptStep.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          errorMessage: null,
        },
      })
    })

    return 'completed' as const
  } catch (error) {
    await failPipelineRun({
      runId: run.id,
      projectId: run.projectId,
      stepId: scriptStep.id,
      error,
    })
    return 'failed' as const
  }
}

async function runImageGeneration(
  run: LoadedPipelineRun,
  imageStep: LoadedPipelineStep
) {
  if (imageStep.status === 'COMPLETED' || imageStep.status === 'SKIPPED') {
    return 'completed' as const
  }

  const claimed = await claimStep(imageStep.id)

  if (!claimed) {
    return 'busy' as const
  }

  try {
    const scenes = await prisma.scene.findMany({
      where: { projectId: run.projectId },
      orderBy: { sortOrder: 'asc' },
    })

    if (scenes.length === 0) {
      throw new Error('Cannot generate images before scenes exist')
    }

    for (const scene of scenes) {
      const existingAsset = await prisma.asset.findFirst({
        where: {
          pipelineStepId: imageStep.id,
          sceneId: scene.id,
          assetType: 'IMAGE',
        },
      })

      if (existingAsset) {
        continue
      }

      const reusableAsset = await prisma.asset.findFirst({
        where: {
          sceneId: scene.id,
          assetType: 'IMAGE',
          pipelineStep: {
            stepType: 'IMAGE_GENERATION',
            pipelineRun: {
              projectId: run.projectId,
              id: {
                not: run.id,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      if (reusableAsset) {
        await prisma.asset.create({
          data: {
            pipelineStepId: imageStep.id,
            sceneId: scene.id,
            assetType: 'IMAGE',
            fileName: reusableAsset.fileName,
            storageKey: reusableAsset.storageKey,
            storageUrl: reusableAsset.storageUrl,
            mimeType: reusableAsset.mimeType,
          },
        })
        continue
      }

      const prompt = buildSceneImagePrompt({
        projectTitle: run.project.title,
        projectPrompt: run.project.prompt,
        sceneNumber: scene.sortOrder,
        sceneTitle: scene.title,
        sceneContent: scene.content,
      })

      const generatedImage = await generateSceneImage({ prompt })
      const uploadedImage = await uploadImageAsset({
        projectId: run.projectId,
        runId: run.id,
        sceneId: scene.id,
        bytes: generatedImage.bytes,
        mimeType: generatedImage.mimeType,
      })

      try {
        await prisma.asset.create({
          data: {
            pipelineStepId: imageStep.id,
            sceneId: scene.id,
            assetType: 'IMAGE',
            fileName: uploadedImage.fileName,
            storageKey: uploadedImage.storageKey,
            storageUrl: uploadedImage.storageUrl,
            mimeType: generatedImage.mimeType,
          },
        })
      } catch (error) {
        await deleteStoredAsset(uploadedImage.storageKey)
        throw error
      }
    }

    await prisma.pipelineStep.update({
      where: { id: imageStep.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        errorMessage: null,
      },
    })

    return 'completed' as const
  } catch (error) {
    await failPipelineRun({
      runId: run.id,
      projectId: run.projectId,
      stepId: imageStep.id,
      error,
    })
    return 'failed' as const
  }
}

async function claimStep(stepId: string) {
  const staleBefore = new Date(Date.now() - STALE_STEP_WINDOW_MS)
  const result = await prisma.pipelineStep.updateMany({
    where: {
      id: stepId,
      OR: [
        {
          status: {
            in: ['PENDING', 'FAILED'],
          },
        },
        {
          status: 'RUNNING',
          startedAt: {
            lt: staleBefore,
          },
        },
      ],
    },
    data: {
      status: 'RUNNING',
      startedAt: new Date(),
      completedAt: null,
      errorMessage: null,
    },
  })

  return result.count === 1
}

export function isPipelineStepStale(startedAt: Date | null | undefined) {
  if (!startedAt) {
    return false
  }

  return Date.now() - startedAt.getTime() > STALE_STEP_WINDOW_MS
}

async function finalizePipelineRunIfReady(runId: string, projectId: string) {
  const steps = await prisma.pipelineStep.findMany({
    where: { pipelineRunId: runId },
  })

  const requiredStepsFinished = steps.every((step) => {
    if (step.stepType === 'SCRIPT_GENERATION' || step.stepType === 'IMAGE_GENERATION') {
      return step.status === 'COMPLETED'
    }

    return step.status === 'COMPLETED' || step.status === 'SKIPPED'
  })

  if (!requiredStepsFinished) {
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.pipelineRun.update({
      where: { id: runId },
      data: { status: 'COMPLETED' },
    })

    await tx.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' },
    })
  })
}

async function failPipelineRun(input: {
  runId: string
  projectId: string
  stepId: string
  error: unknown
}) {
  const errorMessage = normalizeError(input.error)

  console.error('Pipeline execution failed:', errorMessage)

  await prisma.$transaction(async (tx) => {
    await tx.pipelineStep.update({
      where: { id: input.stepId },
      data: {
        status: 'FAILED',
        errorMessage,
        completedAt: new Date(),
      },
    })

    await tx.pipelineRun.update({
      where: { id: input.runId },
      data: { status: 'FAILED' },
    })

    await tx.project.update({
      where: { id: input.projectId },
      data: { status: 'FAILED' },
    })
  })
}

async function generateScreenplay(prompt: string) {
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
Return ONLY valid JSON, no other text.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText = completion.choices[0]?.message.content

  if (!responseText) {
    throw new Error('Empty response from OpenAI')
  }

  let screenplay: ScreenplayPayload

  try {
    screenplay = JSON.parse(extractJsonObject(responseText)) as ScreenplayPayload
  } catch {
    throw new Error('OpenAI returned invalid screenplay JSON')
  }

  if (!Array.isArray(screenplay.scenes) || screenplay.scenes.length === 0) {
    throw new Error('OpenAI returned no screenplay scenes')
  }

  return {
    title: typeof screenplay.title === 'string' ? screenplay.title : null,
    scenes: screenplay.scenes.map((scene, index) => {
      if (!scene || typeof scene.title !== 'string' || typeof scene.content !== 'string') {
        throw new Error(`Scene ${index + 1} is missing a title or content`)
      }

      return {
        title: scene.title.trim() || `Scene ${index + 1}`,
        content: scene.content.trim(),
      }
    }),
  }
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown pipeline error'
}

function extractJsonObject(value: string) {
  const trimmed = value.trim()

  if (trimmed.startsWith('```')) {
    const fenced = trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')

    return fenced.trim()
  }

  return trimmed
}