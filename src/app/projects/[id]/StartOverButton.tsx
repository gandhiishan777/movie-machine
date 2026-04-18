'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type StartOverButtonProps = {
  projectId: string
  variant?: 'default' | 'primary'
}

export default function StartOverButton({ projectId, variant = 'default' }: StartOverButtonProps) {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const doReset = async () => {
    setConfirming(false)
    setIsResetting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/reset`, { method: 'POST' })
      if (!res.ok) throw new Error('Reset failed')
      router.refresh()
    } catch {
      setIsResetting(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {confirming ? (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={variant === 'primary'
            ? 'flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2'
            : 'flex items-center gap-2'
          }
        >
          <span className="text-xs text-white/40">Wipe and regenerate?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={doReset}
              className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              Yes, start over
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="button"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          onClick={() => setConfirming(true)}
          disabled={isResetting}
          className={[
            'cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-full',
            variant === 'primary'
              ? 'px-8 py-3 text-sm text-white bg-gradient-to-r from-[#CA8A04] to-[#92400e] shadow-[0_0_20px_rgba(202,138,4,0.3)] hover:shadow-[0_0_30px_rgba(202,138,4,0.5)]'
              : 'px-4 py-2 text-sm text-white/45 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]',
          ].join(' ')}
        >
          {isResetting ? 'Restarting...' : 'Start Over'}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
