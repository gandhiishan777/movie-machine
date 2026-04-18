'use client'

import { motion } from 'framer-motion'

export default function GenerateButton({ disabled }: { disabled?: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="relative w-full overflow-hidden rounded-full py-4 text-base font-bold tracking-widest uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
      style={{
        background: disabled
          ? 'rgba(202,138,4,0.3)'
          : 'linear-gradient(135deg, #CA8A04 0%, #92400e 50%, #CA8A04 100%)',
        backgroundSize: '200% 100%',
        boxShadow: disabled ? 'none' : '0 0 30px rgba(202,138,4,0.4), 0 0 80px rgba(202,138,4,0.15)',
      }}
    >
      {/* Shimmer sweep */}
      {!disabled && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_0.7s_ease_forwards]"
        />
      )}

      <span className="relative z-10 text-white">
        Generate My Movie →
      </span>
    </motion.button>
  )
}
