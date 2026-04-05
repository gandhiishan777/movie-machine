'use client'

export default function GenerateButton({ disabled }: { disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full bg-[#E11D48] hover:bg-[#BE123C] active:bg-[#9F1239] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors cursor-pointer text-base tracking-wide"
    >
      Generate My Movie →
    </button>
  )
}
