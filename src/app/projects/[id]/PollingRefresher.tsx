'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PollingRefresher({ isGenerating }: { isGenerating: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (!isGenerating) return

    const interval = setInterval(() => {
      router.refresh()
    }, 2000)

    return () => clearInterval(interval)
  }, [isGenerating, router])

  return null
}
