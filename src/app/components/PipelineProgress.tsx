'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { IconCheck, IconCircleX, IconLock } from './icons'

interface PipelineStepData {
  id: string
  stepType: 'SCRIPT_GENERATION' | 'IMAGE_GENERATION' | 'AUDIO_GENERATION' | 'ASSEMBLY'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  sortOrder: number
  errorMessage?: string | null
}

type DisplayStatus = 'RUNNING' | 'QUEUED' | 'LOCKED' | 'SKIPPED' | 'COMPLETED' | 'FAILED'

const STEP_META: Record<PipelineStepData['stepType'], { label: string; description: string; icon: string }> = {
  SCRIPT_GENERATION: { label: 'Script Generation',  description: 'Writing your screenplay with GPT-4o',      icon: '01' },
  IMAGE_GENERATION:  { label: 'Image Generation',   description: 'Visualising each scene with Gemini Flash',  icon: '02' },
  AUDIO_GENERATION:  { label: 'Audio Generation',   description: 'Adding voice & original score',             icon: '03' },
  ASSEMBLY:          { label: 'Final Assembly',      description: 'Composing the finished film',               icon: '04' },
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
  icon,
  status,
  index,
}: {
  label: string
  description: string
  icon: string
  status: DisplayStatus
  index: number
}) {
  const isActive    = status === 'RUNNING'
  const isDone      = status === 'COMPLETED'
  const isFailed    = status === 'FAILED'
  const isInactive  = status === 'QUEUED' || status === 'LOCKED' || status === 'SKIPPED'

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={[
        'relative flex items-center gap-5 px-5 py-4 rounded-xl border transition-all duration-500',
        isActive  ? 'bg-[#CA8A04]/[0.07] border-[#CA8A04]/30 border-glow-gold' : '',
        isDone    ? 'bg-emerald-500/[0.05] border-emerald-500/20' : '',
        isFailed  ? 'bg-red-500/[0.06] border-red-500/20' : '',
        isInactive ? 'border-white/[0.05] opacity-35' : '',
      ].join(' ')}
    >
      {/* Active progress shimmer */}
      {isActive && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#CA8A04]/8 to-transparent animate-[shimmer_2s_linear_infinite]" />
        </div>
      )}

      {/* Step number / icon */}
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative w-10 h-10 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full border-2 border-[#CA8A04]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#CA8A04] animate-spin" />
              <div className="w-2 h-2 rounded-full bg-[#CA8A04] gold-pulse" />
            </motion.div>
          )}
          {isDone && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
            >
              <IconCheck className="w-5 h-5 text-emerald-400" />
            </motion.div>
          )}
          {isFailed && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center"
            >
              <IconCircleX className="w-5 h-5 text-red-400" />
            </motion.div>
          )}
          {(status === 'LOCKED') && (
            <motion.div key="locked" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
              <IconLock className="w-4 h-4 text-white/20" />
            </motion.div>
          )}
          {(status === 'QUEUED' || status === 'SKIPPED') && (
            <motion.div key="queued" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
              <span className="text-[11px] font-bold text-white/20 font-mono">{icon}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={[
            'font-semibold text-sm',
            isActive ? 'text-[#FDE68A]' : isDone ? 'text-white' : 'text-white/50',
          ].join(' ')}>
            {label}
          </p>

          {isActive && (
            <span className="text-[10px] bg-[#CA8A04]/15 text-[#CA8A04] px-2 py-0.5 rounded-full font-bold tracking-[0.15em] uppercase border border-[#CA8A04]/20">
              In progress
            </span>
          )}
          {status === 'LOCKED' && (
            <span className="text-[10px] bg-white/[0.04] text-white/30 px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
              Coming soon
            </span>
          )}
          {status === 'SKIPPED' && (
            <span className="text-[10px] bg-white/[0.04] text-white/30 px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
              Later phase
            </span>
          )}
          {status === 'QUEUED' && (
            <span className="text-[10px] bg-white/[0.04] text-white/30 px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
              Queued
            </span>
          )}
          {isDone && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase border border-emerald-500/20">
              Complete
            </span>
          )}
        </div>
        <p className={[
          'text-xs mt-0.5',
          isActive ? 'text-[#CA8A04]/60' : 'text-white/25',
        ].join(' ')}>
          {description}
        </p>
      </div>
    </motion.div>
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

  const completedCount = steps.filter((s) => s.status === 'COMPLETED').length
  const totalActive = stepOrder.filter((type) => {
    const step = steps.find((s) => s.stepType === type)
    return step && step.status !== 'SKIPPED'
  }).length
  const progressPct = totalActive > 0 ? (completedCount / totalActive) * 100 : 0

  return (
    <div className="w-full max-w-md">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8"
      >
        <p className="text-[#CA8A04] text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
          Now generating
        </p>
        <h2 className="text-3xl font-black tracking-tight text-white">{title}</h2>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex justify-between text-[10px] text-white/30 font-mono mb-2">
          <span>PIPELINE PROGRESS</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #92400e, #CA8A04, #FDE68A)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Steps */}
      <div className="relative bg-[#1C1917]/70 border border-[#44403C]/40 rounded-2xl p-4 space-y-2 backdrop-blur-sm">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/30 to-transparent" />

        {stepOrder.map((type, i) => {
          const step = steps.find((s) => s.stepType === type)
          const meta = STEP_META[type]
          const status: DisplayStatus = step ? toDisplayStatus(step.status) : 'LOCKED'
          return (
            <PipelineStepRow
              key={type}
              label={meta.label}
              description={meta.description}
              icon={meta.icon}
              status={status}
              index={i}
            />
          )
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-white/15 text-xs mt-6"
      >
        Scripts land first · Storyboard frames usually take another minute or two
      </motion.p>
    </div>
  )
}
