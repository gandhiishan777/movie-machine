'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function PollingRefresher({
  projectId,
  isGenerating,
}: {
  projectId: string
  isGenerating: boolean
}) {
  const router = useRouter()
  const lastVersionRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isGenerating) return

    let cancelled = false

    const poll = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/status`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as {
          version: string
          projectStatus: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED'
        }

        if (cancelled) {
          return
        }

        if (lastVersionRef.current && lastVersionRef.current !== payload.version) {
          router.refresh()
        }

        lastVersionRef.current = payload.version

        if (payload.projectStatus !== 'DRAFT' && payload.projectStatus !== 'GENERATING') {
          router.refresh()
        }
      } catch {
        // Swallow polling errors and try again on the next interval.
      }
    }

    void poll()

    const interval = setInterval(() => {
      void poll()
    }, 2500)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isGenerating, projectId, router])

  return null
}
