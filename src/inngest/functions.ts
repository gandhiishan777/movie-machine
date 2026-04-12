import { inngest } from './client'
import {
  runScriptGeneration,
  runImageGeneration,
  runAudioGeneration,
  runAssembly,
  finalizePipelineRun,
} from '@/lib/pipeline'

export const executePipelineFunction = inngest.createFunction(
  {
    id: 'execute-pipeline',
    retries: 3,
    triggers: [{ event: 'pipeline/execute' }],
  },
  async ({ event, step }) => {
    const { runId } = event.data as { runId: string }

    // Each step.run() is an Inngest checkpoint. If the process dies mid-execution,
    // Inngest resumes from the last completed checkpoint on retry — not from the top.
    await step.run('script-generation', () => runScriptGeneration(runId))
    await step.run('image-generation', () => runImageGeneration(runId))
    await step.run('audio-generation', () => runAudioGeneration(runId))
    await step.run('assembly', () => runAssembly(runId))
    await step.run('finalize', () => finalizePipelineRun(runId))
  }
)
