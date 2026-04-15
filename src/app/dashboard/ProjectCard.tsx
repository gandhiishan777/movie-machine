'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

type Project = {
  id: string
  title: string
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED'
  createdAt: Date
  pipelineRuns: { id: string }[]
}

const statusConfig: Record<
  Project['status'],
  { label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  DRAFT: {
    label: 'Draft',
    textClass: 'text-zinc-400',
    bgClass: 'bg-zinc-400/10',
    borderClass: 'border-zinc-400/20',
  },
  GENERATING: {
    label: 'Generating',
    textClass: 'text-yellow-400',
    bgClass: 'bg-yellow-400/10',
    borderClass: 'border-yellow-400/25',
  },
  COMPLETED: {
    label: 'Completed',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-400/10',
    borderClass: 'border-emerald-400/25',
  },
  FAILED: {
    label: 'Failed',
    textClass: 'text-red-400',
    bgClass: 'bg-red-400/10',
    borderClass: 'border-red-400/25',
  },
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ProjectCard({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const router = useRouter()
  const status = statusConfig[project.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.1,
      }}
      onClick={() => router.push(`/projects/${project.id}`)}
      className="group relative p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#7c3aed]/50 hover:bg-white/[0.07] transition-all duration-250 cursor-pointer"
      style={{
        boxShadow: '0 0 0 0 rgba(124,58,237,0)',
      }}
      whileHover={{
        boxShadow: '0 0 30px rgba(124,58,237,0.12)',
        y: -2,
      }}
    >
      {/* Film strip accent */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#7c3aed]/30 to-transparent" />

      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-semibold text-white text-base leading-snug line-clamp-2 group-hover:text-[#a855f7] transition-colors duration-200">
          {project.title}
        </h3>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${status.textClass} ${status.bgClass} ${status.borderClass}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-2 text-white/35 text-xs">
        {/* Calendar icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5"
          aria-hidden="true"
        >
          <path d="M5.75 7.5a.75.75 0 100 1.5.75.75 0 000-1.5zM5 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM10.25 7.5a.75.75 0 100 1.5.75.75 0 000-1.5zM9.5 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM7.25 7.5a.75.75 0 100 1.5.75.75 0 000-1.5zM6.5 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z" />
          <path
            fillRule="evenodd"
            d="M4.75 1a.75.75 0 01.75.75V3h5V1.75a.75.75 0 011.5 0V3h.25A2.75 2.75 0 0115 5.75v7.5A2.75 2.75 0 0112.25 16H3.75A2.75 2.75 0 011 13.25v-7.5A2.75 2.75 0 013.75 3H4V1.75A.75.75 0 014.75 1zm-1 3.5c-.69 0-1.25.56-1.25 1.25v.75h11v-.75c0-.69-.56-1.25-1.25-1.25H3.75zM2.5 8v5.25c0 .69.56 1.25 1.25 1.25h8.5c.69 0 1.25-.56 1.25-1.25V8h-11z"
            clipRule="evenodd"
          />
        </svg>
        <span>{formatDate(project.createdAt)}</span>
      </div>

      {/* Arrow on hover */}
      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-4 h-4 text-[#7c3aed]"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M2 8a.75.75 0 01.75-.75h8.69L8.22 4.03a.75.75 0 011.06-1.06l4.5 4.25a.75.75 0 010 1.06l-4.5 4.25a.75.75 0 01-1.06-1.06l3.22-3.22H2.75A.75.75 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </motion.div>
  )
}
