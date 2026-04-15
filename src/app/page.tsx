import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import HeroSection from './components/landing/HeroSection'
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
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Landing navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0a0a0a]/70 backdrop-blur-md">
        <span className="text-xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">
          Movie Machine
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 text-sm font-medium text-white rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition-colors duration-200 cursor-pointer"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <HeroSection />
      <HowItWorksSection />
      <FinalCTASection />
    </main>
  )
}
