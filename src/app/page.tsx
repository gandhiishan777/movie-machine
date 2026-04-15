import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import CreateProjectForm from './components/CreateProjectForm'

export default async function Home() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  })

  return (
    <div className="min-h-screen bg-black text-[#F8FAFC]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#E11D48]/4 blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E11D48]/20 to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <CreateProjectForm />
      </div>
    </div>
  )
}
