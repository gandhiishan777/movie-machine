import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { IconCheck, IconCircleX } from '@/app/components/icons'
import PipelineProgress from '@/app/components/PipelineProgress'
import PollingRefresher from './PollingRefresher'
import FailedProjectActions from './FailedProjectActions'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      scenes: { orderBy: { sortOrder: 'asc' } },
      pipelineRuns: {
        include: { steps: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { id: 'desc' },
        take: 1,
      },
    },
  })

  if (!project) notFound()

  const latestRun = project.pipelineRuns[0] ?? null

  return (
    <div className="min-h-screen bg-black text-[#F8FAFC]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#E11D48]/4 blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E11D48]/20 to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">

        {/* ── DRAFT / CREATING ─────────────────────────────────────────── */}
        {project.status === 'DRAFT' && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-12 h-12 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#475569] text-sm tracking-wide">Setting up your project...</p>
            <PollingRefresher isGenerating={true} />
          </div>
        )}

        {/* ── GENERATING — pipeline progress ───────────────────────────── */}
        {project.status === 'GENERATING' && (
          <>
            <PipelineProgress
              title={project.title}
              steps={latestRun?.steps ?? []}
            />
            <PollingRefresher isGenerating={true} />
          </>
        )}

        {/* ── COMPLETED — script reveal ─────────────────────────────────── */}
        {project.status === 'COMPLETED' && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-medium mb-3">
                <IconCheck className="w-4 h-4" />
                Script complete
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-1">{project.title}</h2>
              <p className="text-[#475569] text-sm">
                {project.scenes.length} scene{project.scenes.length !== 1 ? 's' : ''} written
              </p>
            </div>

            <div className="space-y-4">
              {project.scenes.map((scene, i) => (
                <div
                  key={scene.id}
                  className="bg-[#0F0F23] border border-[#1E1B4B] rounded-2xl p-6 scene-card"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 bg-[#E11D48]/15 text-[#E11D48] text-[10px] font-bold px-2 py-1 rounded-full tracking-widest uppercase mt-0.5">
                      Scene {scene.sortOrder}
                    </span>
                    <h3 className="font-semibold text-[#F8FAFC] text-base leading-snug">{scene.title}</h3>
                  </div>
                  <p className="text-[#64748B] leading-relaxed text-sm whitespace-pre-line">
                    {scene.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/"
                className="bg-[#0F0F23] hover:bg-[#1E1B4B] border border-[#1E1B4B] text-[#F8FAFC] font-medium px-8 py-3 rounded-xl transition-colors text-sm inline-block"
              >
                + Write Another Movie
              </Link>
            </div>
          </div>
        )}

        {/* ── FAILED — error state ──────────────────────────────────────── */}
        {project.status === 'FAILED' && (
          <div className="w-full max-w-md text-center">
            <div className="bg-[#E11D48]/8 border border-[#E11D48]/25 rounded-2xl p-10 mb-6">
              <IconCircleX className="w-12 h-12 text-[#E11D48] mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Generation Failed</h2>
              <p className="text-[#475569] text-sm leading-relaxed">
                Something went wrong during script generation. Check your OpenAI API key and try again.
              </p>
            </div>
            <FailedProjectActions projectId={project.id} />
          </div>
        )}

      </div>
    </div>
  )
}
