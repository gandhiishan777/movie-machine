'use client'

import { IconCheck, IconCircleX, IconLock } from './icons'

interface PipelineStepData {
  id: string
  stepType: 'SCRIPT_GENERATION' | 'IMAGE_GENERATION' | 'AUDIO_GENERATION' | 'ASSEMBLY'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  sortOrder: number
  errorMessage?: string | null
}

type DisplayStatus = 'RUNNING' | 'QUEUED' | 'LOCKED' | 'SKIPPED' | 'COMPLETED' | 'FAILED'

const STEP_META: Record<PipelineStepData['stepType'], { label: string; description: string }> = {
  SCRIPT_GENERATION: { label: 'Script Generation', description: 'Writing your screenplay with GPT-4o' },
  IMAGE_GENERATION:  { label: 'Image Generation',  description: 'Visualising each scene' },
  AUDIO_GENERATION:  { label: 'Audio Generation',  description: 'Adding voice & original score' },
  ASSEMBLY:          { label: 'Final Assembly',     description: 'Composing the finished film' },
}

function toDisplayStatus(status: PipelineStepData['status']): DisplayStatus {
  if (status === 'RUNNING')   return 'RUNNING'
  if (status === 'COMPLETED') return 'COMPLETED'
  if (status === 'FAILED')    return 'FAILED'
  if (status === 'PENDING')   return 'QUEUED'
  return 'SKIPPED'
}

function PipelineStepRow({
  label,
  description,
  status,
}: {
  label: string
  description: string
  status: DisplayStatus
}) {
  const isActive = status === 'RUNNING'

  return (
    <div
      className={[
        'flex items-center gap-4 p-4 rounded-xl transition-all duration-300',
        isActive
          ? 'bg-[#E11D48]/8 border border-[#E11D48]/25'
          : 'border border-transparent opacity-40',
      ].join(' ')}
    >
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
        {status === 'RUNNING' && (
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#E11D48] border-t-transparent animate-spin" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#E11D48] pulse-ring" />
          </div>
        )}
        {status === 'LOCKED' && (
          <IconLock className="w-5 h-5 text-[#334155]" />
        )}
        {status === 'SKIPPED' && (
          <IconLock className="w-5 h-5 text-[#475569]" />
        )}
        {status === 'QUEUED' && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
        )}
        {status === 'COMPLETED' && (
          <IconCheck className="w-6 h-6 text-emerald-400" />
        )}
        {status === 'FAILED' && (
          <IconCircleX className="w-6 h-6 text-[#E11D48]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-[#F8FAFC] text-sm">{label}</p>
          {status === 'LOCKED' && (
            <span className="text-[10px] bg-[#1E1B4B] text-[#475569] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
              Coming soon
            </span>
          )}
          {status === 'SKIPPED' && (
            <span className="text-[10px] bg-[#1E293B]/40 text-[#94A3B8] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
              Later phase
            </span>
          )}
          {status === 'QUEUED' && (
            <span className="text-[10px] bg-[#334155]/35 text-[#CBD5E1] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
              Queued
            </span>
          )}
          {status === 'RUNNING' && (
            <span className="text-[10px] bg-[#E11D48]/20 text-[#E11D48] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
              In progress
            </span>
          )}
        </div>
        <p className="text-[#475569] text-xs mt-0.5">{description}</p>
      </div>
    </div>
  )
}

export default function PipelineProgress({
  title,
  steps,
}: {
  title: string
  steps: PipelineStepData[]
}) {
  const stepOrder: PipelineStepData['stepType'][] = [
    'SCRIPT_GENERATION',
    'IMAGE_GENERATION',
    'AUDIO_GENERATION',
    'ASSEMBLY',
  ]

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <p className="text-[#475569] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
          Now generating
        </p>
        <h2 className="text-3xl font-bold">{title}</h2>
      </div>

      <div className="bg-[#0F0F23] border border-[#1E1B4B] rounded-2xl p-6 space-y-2">
        {stepOrder.map((type) => {
          const step = steps.find((s) => s.stepType === type)
          const meta = STEP_META[type]
          const status: DisplayStatus = step ? toDisplayStatus(step.status) : 'LOCKED'
          return (
            <PipelineStepRow
              key={type}
              label={meta.label}
              description={meta.description}
              status={status}
            />
          )
        })}
      </div>

      <p className="text-center text-[#1E2940] text-xs mt-6">
        Scripts land first. Storyboard frames usually take another minute or two.
      </p>
    </div>
  )
}
