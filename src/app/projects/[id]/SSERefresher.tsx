'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function SSERefresher({
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

    const es = new EventSource(`/api/projects/${projectId}/stream`)

    es.onmessage = (event) => {
      const payload = JSON.parse(event.data as string) as {
        version: string
        projectStatus: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED'
      }

      if (lastVersionRef.current && lastVersionRef.current !== payload.version) {
        router.refresh()
      }

      lastVersionRef.current = payload.version

      if (payload.projectStatus !== 'DRAFT' && payload.projectStatus !== 'GENERATING') {
        router.refresh()
      }
    }

    es.onerror = () => {
      // EventSource retries automatically; nothing to do here.
    }

    return () => {
      es.close()
    }
  }, [isGenerating, projectId, router])

  return null
}
