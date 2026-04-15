import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import ProjectCard from './ProjectCard'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      pipelineRuns: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-md">
        <Link
          href="/dashboard"
          className="text-xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-200"
        >
          Movie Machine
        </Link>
        <UserButton />
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Your Movies</h1>
            <p className="text-white/40 text-sm mt-1">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-white bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:opacity-85 transition-opacity duration-200 cursor-pointer shadow-[0_0_24px_rgba(124,58,237,0.25)] self-start sm:self-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Movie
          </Link>
        </div>

        {projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
              {/* Film strip icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-9 h-9 text-white/25"
                aria-hidden="true"
              >
                <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25z" />
                <path d="M13.5 6.375c0-1.035.84-1.875 1.875-1.875h1.5c1.035 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-1.5A1.875 1.875 0 0113.5 13.125V6.375zM1.5 13.5V16.5c0 1.035.84 1.875 1.875 1.875h8.25c1.035 0 1.875-.84 1.875-1.875V13.5H1.5z" />
                <path d="M4.5 6.375a.375.375 0 11-.75 0 .375.375 0 01.75 0zM4.5 9.375a.375.375 0 11-.75 0 .375.375 0 01.75 0zM9.75 6.375a.375.375 0 11-.75 0 .375.375 0 01.75 0zM9.75 9.375a.375.375 0 11-.75 0 .375.375 0 01.75 0zM16.875 6.375a.375.375 0 11-.75 0 .375.375 0 01.75 0zM16.875 9.375a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No movies yet</h2>
            <p className="text-white/40 text-sm mb-8 max-w-xs">
              Write a prompt and let AI build your first movie from scratch.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:opacity-85 transition-opacity duration-200 cursor-pointer"
            >
              Create your first movie
            </Link>
          </div>
        ) : (
          /* Project grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
