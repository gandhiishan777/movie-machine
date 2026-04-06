import { GoogleGenAI } from '@google/genai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image'

let geminiClient: GoogleGenAI | null = null

function getGeminiClient() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  geminiClient ??= new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  return geminiClient
}

export function getGeminiImageModel() {
  return GEMINI_IMAGE_MODEL
}

export function buildSceneImagePrompt(input: {
  projectTitle: string
  projectPrompt: string
  sceneNumber: number
  sceneTitle: string
  sceneContent: string
}) {
  return [
    `Create a cinematic storyboard frame for a movie titled "${input.projectTitle}".`,
    `Overall movie concept: ${input.projectPrompt}`,
    `This is scene ${input.sceneNumber}: ${input.sceneTitle}.`,
    `Scene details: ${input.sceneContent}`,
    'Style requirements: dramatic lighting, polished concept-art realism, strong composition, rich atmosphere, no text, no captions, no watermark.',
    'Output a single high-quality horizontal frame suitable for a movie storyboard.',
  ].join(' ')
}

export async function generateSceneImage(input: {
  prompt: string
  aspectRatio?: string
}) {
  const ai = getGeminiClient()
  const response = await ai.models.generateContent({
    model: getGeminiImageModel(),
    contents: input.prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: input.aspectRatio ?? '16:9',
      },
    },
  })

  const parts = response.candidates?.[0]?.content?.parts ?? []

  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        bytes: Buffer.from(part.inlineData.data, 'base64'),
        mimeType: part.inlineData.mimeType ?? 'image/png',
        text: response.text ?? null,
      }
    }
  }

  throw new Error('Gemini did not return an image payload')
}
