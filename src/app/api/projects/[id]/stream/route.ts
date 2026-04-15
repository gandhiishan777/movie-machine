import {
  PROJECT_UPDATES_CHANNEL,
  LISTEN_FALLBACK_INTERVAL_MS,
  NOTIFY_DEBOUNCE_MS,
  DEGRADED_POLL_INTERVAL_MS,
  computeStreamVersion,
  fetchProjectStreamSnapshot,
  formatSseDataPayload,
  formatSseEvent,
  maybeRecoverStalePipelineRun,
} from '@/lib/project-stream'
import { createListenClient } from '@/lib/pg-listen-client'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { id } = await params

  const projectOwner = await prisma.project.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!projectOwner || projectOwner.userId !== userId) {
    return new Response('Not Found', { status: 404 })
  }
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false
      let lastVersion: string | null = null
      let streamCompleted = false

      let listenClient: ReturnType<typeof createListenClient> | null = null
      let fallbackInterval: ReturnType<typeof setInterval> | null = null
      let debounceTimer: ReturnType<typeof setTimeout> | null = null

      let resolveDone: (() => void) | null = null
      const donePromise = new Promise<void>((resolve) => {
        resolveDone = resolve
      })

      function safeCloseController() {
        if (closed) return
        closed = true
        try {
          controller.close()
        } catch {
          // already closed
        }
      }

      function safeEnqueue(text: string) {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(text))
        } catch {
          closed = true
        }
      }

      async function teardown() {
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer)
          debounceTimer = null
        }
        if (fallbackInterval !== null) {
          clearInterval(fallbackInterval)
          fallbackInterval = null
        }
        if (listenClient) {
          const c = listenClient
          listenClient = null
          c.removeAllListeners('notification')
          try {
            await c.query(`UNLISTEN ${PROJECT_UPDATES_CHANNEL}`)
          } catch {
            // ignore
          }
          try {
            c.end()
          } catch {
            // ignore
          }
        }
      }

      async function tick(): Promise<'missing' | 'terminal' | 'active'> {
        const project = await fetchProjectStreamSnapshot(id)
        if (!project) {
          return 'missing'
        }

        await maybeRecoverStalePipelineRun(project)

        const { version } = computeStreamVersion(project)
        if (version !== lastVersion) {
          lastVersion = version
          safeEnqueue(formatSseEvent(formatSseDataPayload(version, project.status)))
        }

        if (project.status === 'COMPLETED' || project.status === 'FAILED') {
          return 'terminal'
        }
        return 'active'
      }

      async function completeStream() {
        if (streamCompleted) return
        streamCompleted = true
        request.signal.removeEventListener('abort', onAbort)
        await teardown()
        safeCloseController()
        resolveDone?.()
      }

      const onAbort = () => {
        void completeStream()
      }
      request.signal.addEventListener('abort', onAbort)

      // Pre-LISTEN snapshot
      let state = await tick()
      if (state === 'missing') {
        await completeStream()
        return
      }
      if (state === 'terminal') {
        await completeStream()
        return
      }

      let usePollingFallback = false
      try {
        listenClient = createListenClient()
        await listenClient.connect()
        await listenClient.query(`LISTEN ${PROJECT_UPDATES_CHANNEL}`)
      } catch (error) {
        usePollingFallback = true
        console.warn(
          '[project-stream] LISTEN setup failed, falling back to polling',
          error
        )
        if (listenClient) {
          try {
            listenClient.removeAllListeners('notification')
            listenClient.end()
          } catch {
            // ignore
          }
          listenClient = null
        }
      }

      if (usePollingFallback) {
        while (!request.signal.aborted && !closed) {
          const r = await tick()
          if (r === 'missing' || r === 'terminal') {
            break
          }
          await sleep(DEGRADED_POLL_INTERVAL_MS)
        }
        await completeStream()
        return
      }

      if (!listenClient) {
        await completeStream()
        return
      }

      // Post-LISTEN snapshot (narrow race with NOTIFY)
      state = await tick()
      if (state === 'missing' || state === 'terminal') {
        await completeStream()
        return
      }

      const scheduleRefresh = () => {
        if (closed) return
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer)
        }
        debounceTimer = setTimeout(() => {
          debounceTimer = null
          if (closed) return
          void (async () => {
            const r = await tick()
            if (r === 'missing' || r === 'terminal') {
              await completeStream()
            }
          })()
        }, NOTIFY_DEBOUNCE_MS)
      }

      listenClient.on('notification', (msg) => {
        if (closed || !msg.payload) return
        let parsed: unknown
        try {
          parsed = JSON.parse(msg.payload)
        } catch {
          return
        }
        if (!parsed || typeof parsed !== 'object') return
        const projectId = (parsed as { projectId?: unknown }).projectId
        if (typeof projectId !== 'string' || projectId !== id) return
        scheduleRefresh()
      })

      fallbackInterval = setInterval(() => {
        if (closed) return
        void (async () => {
          const r = await tick()
          if (r === 'missing' || r === 'terminal') {
            await completeStream()
          }
        })()
      }, LISTEN_FALLBACK_INTERVAL_MS)

      await donePromise
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
