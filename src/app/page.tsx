import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import HeroSection from './components/landing/HeroSection'
import MovieGenerationSection from './components/landing/MovieGenerationSection'
import HowItWorksSection from './components/landing/HowItWorksSection'
import FinalCTASection from './components/landing/FinalCTASection'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    })
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#0c0a09] text-white" style={{ overflowX: 'clip' }}>
      {/* Landing navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#44403C]/40 bg-[#0c0a09]/80 backdrop-blur-md">
        <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-[#FDE68A] via-[#CA8A04] to-[#92400e] bg-clip-text text-transparent">
          Movie Machine
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 text-sm font-bold text-white rounded-full border border-[#CA8A04]/30 bg-[#CA8A04]/10 hover:bg-[#CA8A04]/20 hover:border-[#CA8A04]/50 transition-all duration-200 cursor-pointer"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <HeroSection />
      <MovieGenerationSection promptText="A noir detective in 1940s Tokyo uncovers a letter that rewrites the war." />
      <HowItWorksSection />
      <FinalCTASection />
    </main>
  )
}
