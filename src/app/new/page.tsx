import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import CreateProjectForm from '@/app/components/CreateProjectForm'

export default async function NewProjectPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-white overflow-hidden">

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Hero grid */}
        <div className="absolute inset-0 hero-grid opacity-60" />

        {/* Grain */}
        <div className="absolute inset-0 grain-overlay" />

        {/* Floating orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#CA8A04]/[0.06] blur-[160px] animate-float-a" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#7c3aed]/[0.05] blur-[180px] animate-float-b" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full bg-[#CA8A04]/[0.04] blur-[120px] animate-float-c" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/25 to-transparent" />

        {/* Scanlines */}
        <div className="absolute inset-0 scanlines pointer-events-none" />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-[#44403C]/40 bg-[#0c0a09]/70 backdrop-blur-md">
        <Link
          href="/dashboard"
          className="text-xl font-black tracking-tighter bg-gradient-to-r from-[#FDE68A] via-[#CA8A04] to-[#92400e] bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-200"
        >
          Movie Machine
        </Link>
        <UserButton />
      </nav>

      {/* ── Main ── */}
      <main className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <CreateProjectForm />
      </main>
    </div>
  )
}
