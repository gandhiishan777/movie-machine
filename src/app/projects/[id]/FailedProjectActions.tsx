'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FailedProjectActions({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await fetch(`/api/projects/${projectId}/generate`, { method: 'POST' })
      router.refresh()
    } catch {
      setIsRetrying(false)
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={handleRetry}
        disabled={isRetrying}
        className="bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer text-sm"
      >
        {isRetrying ? 'Retrying...' : 'Try Again'}
      </button>
      <button
        onClick={() => router.push('/')}
        className="bg-[#0F0F23] hover:bg-[#1E1B4B] border border-[#1E1B4B] text-[#F8FAFC] font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer text-sm"
      >
        Start Over
      </button>
    </div>
  )
}
