# Movie Machine Interview Prep Pack

This is the short version of the codebase guide in [`codebase-explainer.md`](./codebase-explainer.md). Use this when you need fast recall, not a full tour.

## 1-Page Cheat Sheet

### 10-second summary

Movie Machine is a Next.js App Router app where a user submits a movie idea, the app stores a `Project` in Postgres through Prisma, kicks off a background Inngest job, uses OpenAI to generate scenes, uses Gemini to generate storyboard images, stores image bytes in Cloudflare R2, and keeps the project page updated through an SSE stream that triggers `router.refresh()`.

### Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js App Router, React 19, Tailwind |
| Backend | Next.js route handlers, server components |
| DB | PostgreSQL + Prisma |
| Background jobs | Inngest |
| LLM for script | OpenAI `gpt-4o-mini` |
| Image generation | Gemini image model |
| File storage | Cloudflare R2 via S3 SDK |
| Live updates | SSE + `EventSource` + `router.refresh()` |

### Core product flow

1. User opens `/`.
2. [`../src/app/page.tsx`](../src/app/page.tsx) upserts a demo user and renders the form.
3. [`../src/app/components/CreateProjectForm.tsx`](../src/app/components/CreateProjectForm.tsx) calls `POST /api/projects`.
4. [`../src/app/api/projects/route.ts`](../src/app/api/projects/route.ts) creates a `Project`.
5. The form calls `POST /api/projects/[id]/generate`.
6. [`../src/app/api/projects/[id]/generate/route.ts`](../src/app/api/projects/[id]/generate/route.ts) calls `preparePipelineRun()` and sends Inngest event `pipeline/execute`.
7. [`../src/inngest/functions.ts`](../src/inngest/functions.ts) runs the background job.
8. [`../src/lib/pipeline.ts`](../src/lib/pipeline.ts) runs script generation, image generation, then finalization.
9. The project page listens to [`../src/app/api/projects/[id]/stream/route.ts`](../src/app/api/projects/[id]/stream/route.ts) through [`../src/app/projects/[id]/SSERefresher.tsx`](../src/app/projects/[id]/SSERefresher.tsx).
10. On version change, the client calls `router.refresh()` and the server component page re-reads the DB.

### What each important route does

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/projects` | `POST` | Create a new project from `title`, `prompt`, `userId`. |
| `/api/projects` | `GET` | List projects for a `userId`. |
| `/api/projects/[id]` | `GET` | Return full project graph including scenes, runs, steps, and assets. |
| `/api/projects/[id]/generate` | `POST` | Create/reuse a pipeline run and emit the Inngest event. |
| `/api/projects/[id]/status` | `GET` | Return summarized progress JSON and possibly schedule recovery. |
| `/api/projects/[id]/stream` | `GET` | SSE stream for live progress updates. |
| `/api/assets/[id]` | `GET` | Read stored asset bytes from R2 and proxy them to the browser. |
| `/api/inngest` | `GET`, `POST`, `PUT` | Inngest execution endpoint via `serve()`. |

### What each important model means

| Model | Meaning |
| --- | --- |
| `User` | Owner of projects. |
| `Project` | Top-level movie idea and its overall status. |
| `Scene` | Ordered screenplay scenes generated from the prompt. |
| `PipelineRun` | One attempt to generate a project. |
| `PipelineStep` | One stage inside a run. |
| `Asset` | Generated file metadata, mainly storyboard images today. |

### Pipeline step order

1. `SCRIPT_GENERATION`
2. `IMAGE_GENERATION`
3. `AUDIO_GENERATION`
4. `ASSEMBLY`

Current reality:

- Script generation is implemented.
- Image generation is implemented.
- Audio generation is skipped.
- Final assembly is skipped.

### Most important files to remember

| File | Why it matters |
| --- | --- |
| [`../src/lib/pipeline.ts`](../src/lib/pipeline.ts) | The core business logic of the app. |
| [`../src/app/api/projects/[id]/generate/route.ts`](../src/app/api/projects/[id]/generate/route.ts) | The route that starts background generation. |
| [`../src/inngest/functions.ts`](../src/inngest/functions.ts) | Defines the background execution pipeline. |
| [`../src/app/api/projects/[id]/stream/route.ts`](../src/app/api/projects/[id]/stream/route.ts) | Implements SSE progress updates. |
| [`../src/app/projects/[id]/SSERefresher.tsx`](../src/app/projects/[id]/SSERefresher.tsx) | Client listener that turns SSE changes into UI refreshes. |
| [`../src/app/projects/[id]/page.tsx`](../src/app/projects/[id]/page.tsx) | Main server-rendered project page. |
| [`../src/lib/storage.ts`](../src/lib/storage.ts) | Stores images in Cloudflare R2. |
| [`../src/lib/db.ts`](../src/lib/db.ts) | Shared Prisma/Postgres setup. |
| [`../prisma/schema.prisma`](../prisma/schema.prisma) | Source of truth for the domain model. |

### Why Inngest is used

- AI generation is too slow for a normal request-response cycle.
- Jobs need retries and checkpoints.
- The app needs durable state outside the original browser request.
- `step.run()` lets execution resume from the last completed checkpoint.

### Why SSE is used

- The UI needs live updates during generation.
- The app only needs server-to-client messages, not two-way sockets.
- The real source of truth is the DB, so SSE just signals "refresh now."
- The current SSE implementation is server-side polling wrapped in an SSE stream.

### Best "what is special here?" answer

The interesting part is not the UI styling. It is the orchestration model: short HTTP routes create pipeline state, Inngest runs long-lived work, the database stores both output and progress, and the UI stays current by listening to an SSE stream and re-rendering from server-side DB reads.

### Biggest limitations to mention honestly

- No real authentication yet.
- `userId` is trusted from the client.
- SSE is implemented by polling Prisma every second.
- Asset access control is light.
- Audio and assembly are not implemented yet.
- Recovery logic depends on idempotent step claiming and retries working correctly.

## Mock Q&A: Hard Questions

### 1. "Walk me through exactly what happens after the user clicks Generate."

Answer:

The form in [`../src/app/components/CreateProjectForm.tsx`](../src/app/components/CreateProjectForm.tsx) first creates a project through `POST /api/projects`, then immediately calls `POST /api/projects/[id]/generate`. That generate route finds the project, calls `preparePipelineRun()` in [`../src/lib/pipeline.ts`](../src/lib/pipeline.ts), which either reuses a running pipeline or creates a new `PipelineRun` with ordered `PipelineStep` rows. It marks the project as `GENERATING` and sends the Inngest event `pipeline/execute`. Inngest picks that up through [`../src/inngest/functions.ts`](../src/inngest/functions.ts), runs `runScriptGeneration()`, `runImageGeneration()`, skipped audio/assembly stages, and finally `finalizePipelineRun()`. While that is happening, the project page listens to the SSE stream and refreshes when the state changes.

### 2. "Why is `src/lib/pipeline.ts` so important?"

Answer:

Because it is the business logic center of the app. Routes only validate requests and kick work off. `pipeline.ts` is where the system actually decides how runs are created, how steps are claimed, how scenes are generated, how image assets are written, how failures are handled, and when a project is considered complete.

### 3. "Why use Inngest instead of doing it all in the route handler?"

Answer:

Because AI calls are long-running and failure-prone. Doing them in the route would make the request slow, fragile, and hard to retry. Inngest gives the app asynchronous execution, retries, and checkpoints through `step.run()`, which is important because script generation and image generation are separate expensive phases.

### 4. "How does the app avoid duplicate work?"

Answer:

There are a few layers. `preparePipelineRun()` reuses an active running run if one exists. `claimStep()` atomically moves a step into `RUNNING` only if it is eligible, which prevents multiple workers from executing the same step at once. The Inngest event uses the pipeline run ID. Image generation also checks whether an image already exists for the scene and even reuses prior assets from earlier runs when possible.

### 5. "Explain the SSE setup. Is it true real-time?"

Answer:

Not in the sense of database push or WebSockets. The server route [`../src/app/api/projects/[id]/stream/route.ts`](../src/app/api/projects/[id]/stream/route.ts) opens a `ReadableStream`, polls Prisma every second, computes a `version` string, and emits SSE messages only when that version changes. On the client, [`../src/app/projects/[id]/SSERefresher.tsx`](../src/app/projects/[id]/SSERefresher.tsx) listens with `EventSource` and calls `router.refresh()`. So it feels real-time to the user, but technically it is polling on the server side plus SSE delivery to the client.

### 6. "Why call `router.refresh()` instead of storing the whole project in client state?"

Answer:

Because the app is server-first. The project page is a server component that already knows how to query the latest project, scenes, runs, steps, and assets from Prisma. `router.refresh()` keeps the database as the source of truth and avoids building a complex client-side synchronization layer.

### 7. "What happens if a job gets stuck?"

Answer:

The app has explicit stale-run recovery. `claimStep()` can reclaim stale running steps, and both the `status` and `stream` routes check whether a run looks stuck. If it does, they re-send `pipeline/execute` using the run ID so Inngest can resume or retry execution.

### 8. "What are the trade-offs of the current recovery approach?"

Answer:

It is simple and resilient for an MVP, but it relies heavily on idempotency. If step-claiming or asset reuse logic were wrong, retries could cause duplicate work or inconsistent state. It is a pragmatic design, not a mathematically perfect distributed system.

### 9. "How are images stored and served?"

Answer:

Gemini returns image bytes. [`../src/lib/storage.ts`](../src/lib/storage.ts) uploads those bytes to Cloudflare R2 using the S3 SDK, then the app stores asset metadata like `storageKey`, `storageUrl`, `mimeType`, and scene linkage in the `Asset` table. The UI does not fetch directly from R2. It requests `/api/assets/[id]`, and that route reads the object back from R2 and proxies it to the browser.

### 10. "What would you say is unfinished or prototype-grade?"

Answer:

Authentication is placeholder-only, the app trusts `userId` from the client, asset access is weak if IDs leak, SSE uses polling rather than a more scalable event system, and audio/assembly are scaffolded in the schema and UI but not implemented in the backend.

### 11. "Why have both `status` and `stream`?"

Answer:

They solve related but slightly different problems. `stream` is the live-update path used by the current UI. `status` is a polling-friendly JSON endpoint that gives richer summary data and also contains recovery logic through `after()`. Together they show that the backend supports both streaming and polling-style progress observation.

### 12. "If you had to improve one thing first, what would it be?"

Answer:

I would add real auth and authorization first, because the whole project and asset model currently assumes a trusted client. After that I would improve observability around retries and stale runs, then implement audio and assembly so the backend matches the full pipeline shown in the UI.

## 2-3 Minute Talk Track

Use this as a memorization script. You do not need to say every sentence exactly; just keep the structure.

---

Movie Machine is a server-first Next.js App Router application that turns a movie idea into a screenplay and storyboard.

At a high level, the user lands on the home page, enters a title and prompt, and submits the form. The home page currently bootstraps a demo user, because there is no full auth flow yet. The form creates a `Project` in Postgres through Prisma, then immediately calls a generate route.

That generate route is important because it does not perform the AI work directly. Instead, it calls `preparePipelineRun()` in `src/lib/pipeline.ts`, which creates or reuses a `PipelineRun` and inserts ordered `PipelineStep` rows like script generation and image generation. Then it emits an Inngest event called `pipeline/execute`.

Inngest is the background execution layer. In `src/inngest/functions.ts`, the app defines a function that runs the pipeline in checkpoints using `step.run()`. That matters because if the job fails halfway through, Inngest can retry from the last successful checkpoint rather than starting over from scratch.

The real business logic lives in `src/lib/pipeline.ts`. The script stage calls OpenAI with `gpt-4o-mini` and asks for structured screenplay JSON, then writes ordered `Scene` rows into the database. The image stage goes scene by scene, builds a cinematic prompt, calls Gemini to generate an image, uploads the bytes to Cloudflare R2, and writes an `Asset` row in the database. The pipeline then finalizes the run and marks the project complete once the required steps are done.

The UI is built so the database stays the source of truth. The project page is a server component that loads the project, latest run, scenes, steps, and assets directly from Prisma. For live updates, the browser opens an `EventSource` connection to `/api/projects/[id]/stream`. That route is technically an SSE endpoint, but behind the scenes it polls Prisma every second, computes a version string, and emits an event when the version changes. On the client, `SSERefresher` listens for those updates and calls `router.refresh()`, which causes the server component page to re-read the database and show the latest state.

I’d say the most interesting design choice in the codebase is that progress is modeled as database state, not just in-memory job state. That makes the backend recoverable and makes the UI simple, because both the recovery logic and the frontend are reading the same pipeline records.

The biggest current limitations are that auth is still placeholder-only, asset access control is light, SSE is backed by polling rather than a more scalable event system, and audio generation and final assembly are shown in the schema and UI but not implemented yet.

---

## 30-Second Fallback Talk Track

If you get cut off, use this shorter version:

Movie Machine is a Next.js plus Prisma app where project creation is synchronous but generation is asynchronous. The generate route creates a pipeline run and emits an Inngest event. The core orchestration in `src/lib/pipeline.ts` uses OpenAI to create scenes and Gemini plus Cloudflare R2 to create storyboard frames. The project page is server-rendered from Prisma data and stays live through an SSE route that emits version changes and triggers `router.refresh()` on the client.

## Best Last-Minute Drill

Before the interview, make sure you can answer these from memory:

1. What does `POST /api/projects/[id]/generate` do, and what does it intentionally not do?
2. Why is `src/lib/pipeline.ts` the most important file?
3. How does Inngest checkpointing help this app?
4. How does SSE work here, and why is it not really WebSockets?
5. What lives in Postgres versus what lives in R2?
6. What is currently implemented versus scaffolded for later?
