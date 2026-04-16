import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import CreateProjectForm from '@/app/components/CreateProjectForm'

export default async function NewProjectPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-black text-[#F8FAFC]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#E11D48]/4 blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E11D48]/20 to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen px-4 py-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-white/60 transition-colors duration-200 hover:text-white"
          >
            Back to dashboard
          </Link>
        </div>

        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <CreateProjectForm />
        </main>
      </div>
    </div>
  )
}
