'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'framer-motion'

/* ── Typewriter ── */
function Typewriter({ text, charCount, cursor = true }: { text: string; charCount: number; cursor?: boolean }) {
  const shown = text.slice(0, Math.max(0, Math.min(text.length, charCount)))
  return (
    <span>
      {shown}
      {cursor && (
        <span className="inline-block w-[2px] bg-[#CA8A04] h-[1em] align-[-0.15em] ml-0.5 animate-pulse" />
      )}
    </span>
  )
}

/* ── Step label row ── */
function StepLabel({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className={`font-mono text-[10px] tracking-[0.25em] ${done ? 'text-[#CA8A04]' : active ? 'text-[#FDE68A]' : 'text-white/25'}`}>
        {String(num).padStart(2, '0')}
      </span>
      <span className={`font-mono text-[10px] tracking-[0.25em] uppercase truncate ${done ? 'text-white/60' : active ? 'text-white' : 'text-white/25'}`}>
        {label}
      </span>
      <span className={`flex-1 h-px ${done ? 'bg-[#CA8A04]/60' : active ? 'bg-[#CA8A04]/30' : 'bg-white/5'}`} />
    </div>
  )
}

/* ── Scene frame ── */
function SceneFrame({
  title, hue = 28, scene = 'noir', progress, delay = 0, skipEntrance = false,
}: {
  title: string; hue?: number; scene?: 'noir' | 'city' | 'interior'; progress: MotionValue<number>; delay?: number; skipEntrance?: boolean
}) {
  const y  = useTransform(progress, [delay, delay + 0.1], [24, 0])
  const o  = useTransform(progress, [delay, delay + 0.1], [0, 1])
  const sc = useTransform(progress, [delay, delay + 0.1], [0.97, 1])

  const bg = `
    radial-gradient(ellipse at 35% 45%, oklch(0.58 0.18 ${hue}) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 70%, oklch(0.48 0.14 ${hue + 10}) 0%, transparent 60%),
    radial-gradient(ellipse at 50% 30%, oklch(0.52 0.12 ${hue - 5}) 0%, transparent 40%),
    linear-gradient(135deg, oklch(0.30 0.08 ${hue}) 0%, oklch(0.15 0.04 ${hue + 20}) 100%)
  `

  const vigId = `vg-${hue}-${scene}-${delay}`

  return (
    <motion.div
      style={skipEntrance ? { background: bg } : { y, opacity: o, scale: sc, background: bg }}
      className="relative aspect-video w-full rounded-[3px] overflow-hidden border border-[#CA8A04]/40 shadow-[0_0_30px_rgba(202,138,4,0.15),0_0_60px_rgba(0,0,0,0.4)]"
    >
      <svg viewBox="0 0 320 180" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <radialGradient id={vigId} cx="50%" cy="50%" r="65%">
            <stop offset="60%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
          </radialGradient>
        </defs>

        {scene === 'noir' && (
          <g>
            <rect x="0" y="125" width="320" height="55" fill="#000" opacity="0.4" />
            <ellipse cx="160" cy="130" rx="50" ry="60" fill="#000" opacity="0.5" />
            <circle cx="160" cy="90" r="18" fill="#000" opacity="0.6" />
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={i} x1={i * 24 + 8} y1="0" x2={i * 24 + 2} y2="180" stroke="#FDE68A" strokeOpacity="0.12" strokeWidth="1" />
            ))}
            <circle cx="110" cy="60" r="3" fill="#FDE68A" opacity="0.5" />
            <circle cx="210" cy="50" r="2" fill="#FDE68A" opacity="0.35" />
          </g>
        )}
        {scene === 'city' && (
          <g opacity="0.85">
            <rect x="20"  y="80"  width="28" height="100" fill="#1a1000" />
            <rect x="58"  y="55"  width="38" height="125" fill="#1a1000" />
            <rect x="104" y="95"  width="24" height="85"  fill="#1a1000" />
            <rect x="134" y="40"  width="46" height="140" fill="#1a1000" />
            <rect x="188" y="70"  width="30" height="110" fill="#1a1000" />
            <rect x="224" y="88"  width="32" height="92"  fill="#1a1000" />
            <rect x="262" y="60"  width="38" height="120" fill="#1a1000" />
            {[62, 68, 142, 148, 197, 225, 272].map((x, i) => (
              <rect key={i} x={x} y={65 + ((i * 7) % 20)} width="4" height="4" fill="#FDE68A" opacity={0.6 + (i % 3) * 0.15} />
            ))}
            {[75, 155, 240].map((x, i) => (
              <rect key={`w${i}`} x={x} y={90 + i * 12} width="6" height="3" fill="#CA8A04" opacity="0.4" />
            ))}
          </g>
        )}
        {scene === 'interior' && (
          <g>
            <rect x="40"  y="40"  width="240" height="110" fill="#000" opacity="0.3" />
            <rect x="60"  y="60"  width="90"  height="70"  fill="#000" opacity="0.45" />
            <ellipse cx="230" cy="130" rx="55" ry="25" fill="#000" opacity="0.35" />
            <circle cx="100" cy="50" r="10" fill="#FDE68A" opacity="0.6" />
            <circle cx="100" cy="50" r="25" fill="#FDE68A" opacity="0.08" />
            <rect x="80" y="78" width="40" height="2" fill="#FDE68A" opacity="0.25" />
          </g>
        )}

        <rect x="0" y="0" width="320" height="180" fill={`url(#${vigId})`} />
      </svg>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)' }}
      />

      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#FDE68A]">{title}</div>
        <div className="font-mono text-[9px] tracking-[0.2em] text-[#FDE68A]/60">● REC</div>
      </div>
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between font-mono text-[9px] tracking-[0.2em] text-white/50">
        <span>2.39 : 1</span>
        <span>ƒ/1.4 · 35mm</span>
      </div>
    </motion.div>
  )
}

/* ── Main section ── */
export default function MovieGenerationSection({ promptText }: { promptText: string }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const [typedChars, setTypedChars] = useState(0)
  useEffect(() => {
    const computeChars = (v: number) => {
      const pct = (v - 0.02) / (0.16 - 0.02)
      return Math.floor(Math.max(0, Math.min(1, pct)) * promptText.length)
    }
    const apply = () => setTypedChars(computeChars(scrollYProgress.get()))
    requestAnimationFrame(apply)
    const unsub = scrollYProgress.on('change', apply)
    return () => unsub()
  }, [scrollYProgress, promptText])

  // Script bar + animated telemetry
  const scriptProgress = useTransform(scrollYProgress, [0.30, 0.44], [0, 1])
  const scriptPct   = useTransform(scriptProgress, (v) => `${Math.round(v * 100)}%`)
  const scriptWidth = useTransform(scriptProgress, (v) => `${Math.round(v * 100)}%`)
  const telBeats    = useTransform(scriptProgress, (v) => `${Math.round(v * 12)} / 12`)
  const telScenes   = useTransform(scriptProgress, (v) => `${Math.round(v * 8)} / 8`)
  const telTokens   = useTransform(scriptProgress, (v) => {
    const n = Math.round(v * 4128)
    return n >= 1000 ? `${Math.floor(n / 1000)},${String(n % 1000).padStart(3, '0')}` : String(n)
  })

  // 900vh → 800vh scrollable. Each stage gets generous hold time.
  const s1Opacity = useTransform(scrollYProgress, [0.00, 0.04, 0.22, 0.28], [0, 1, 1, 0])
  const s2Opacity = useTransform(scrollYProgress, [0.26, 0.30, 0.44, 0.50], [0, 1, 1, 0])

  // S3+S4 unified: Scene 01 appears, then shrinks/rises as storyboard slides in
  const sceneWrapOp  = useTransform(scrollYProgress, [0.48, 0.52, 0.78, 0.84], [0, 1, 1, 0])
  const s3LabelOp    = useTransform(scrollYProgress, [0.48, 0.52, 0.58, 0.62], [0, 1, 1, 0])
  const scene1Scale  = useTransform(scrollYProgress, [0.60, 0.68], [1, 0.52])
  const scene1Y      = useTransform(scrollYProgress, [0.60, 0.68], [0, -130])
  const s4LabelOp    = useTransform(scrollYProgress, [0.62, 0.68], [0, 1])
  const s4CardsOp    = useTransform(scrollYProgress, [0.62, 0.68], [0, 1])
  const s4y1 = useTransform(scrollYProgress, [0.62, 0.70], [50, 0])
  const s4y2 = useTransform(scrollYProgress, [0.64, 0.72], [50, 0])
  const s4y3 = useTransform(scrollYProgress, [0.66, 0.74], [50, 0])

  // S5: your movie is ready — smooth entry
  const s5Opacity = useTransform(scrollYProgress, [0.82, 0.87, 1.00, 1.00], [0, 1, 1, 1])

  const [stage, setStage] = useState(1)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    let s = 1
    if (v > 0.26) s = 2
    if (v > 0.48) s = 3
    if (v > 0.62) s = 4
    if (v > 0.82) s = 5
    setStage(s)
  })

  const playScale = useTransform(scrollYProgress, [0.82, 0.87], [0.8, 1])
  const playOp    = useTransform(scrollYProgress, [0.82, 0.86], [0, 1])

  const STEPS: [number, string][] = [
    [1, 'Prompt'],
    [2, 'Script'],
    [3, 'Scene 01'],
    [4, 'Storyboard'],
    [5, 'Ready'],
  ]

  return (
    <section ref={sectionRef} className="relative bg-[#0c0a09]" style={{ height: '900vh' }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Ambient */}
        <div className="absolute inset-0 hero-grid opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[320px] rounded-full bg-[#CA8A04]/[0.10] blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 grain-overlay scanlines pointer-events-none" />

        {/* Step indicator */}
        <div className="absolute top-24 left-0 right-0 z-30 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#CA8A04]/80">
                ● The Machine · Session 0042
              </span>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30">
                Step {stage} / 5
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {STEPS.map(([n, label]) => (
                <StepLabel key={n} num={n} label={label} active={stage === n} done={stage > n} />
              ))}
            </div>
          </div>
        </div>

        {/* Stages */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="relative w-full max-w-5xl h-full">

            {/* S1 — Prompt typewriter */}
            <motion.div style={{ opacity: s1Opacity }} className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-3xl">
                <div className="mb-5 flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 border border-[#CA8A04]/25 rounded-full px-3 py-1 bg-[#CA8A04]/5 text-[#CA8A04]/80 text-[10px] font-bold tracking-[0.2em] uppercase font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04] gold-pulse" />
                    Prompt · input
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">author@movie-machine</span>
                </div>
                <div className="rounded-2xl border border-[#CA8A04]/20 bg-[#1C1917]/70 backdrop-blur-sm p-8 shadow-[0_0_60px_rgba(202,138,4,0.08)]">
                  <div className="flex items-center gap-2 mb-5 font-mono text-[10px] text-white/30 tracking-[0.2em] uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#CA8A04]" />
                    <span>describe_story.txt</span>
                  </div>
                  <p
                    className="text-2xl md:text-4xl leading-tight font-semibold text-white/95 tracking-tight"
                    style={{ textWrap: 'balance' } as React.CSSProperties}
                  >
                    <Typewriter text={promptText} charCount={typedChars} />
                  </p>
                </div>
              </div>
            </motion.div>

            {/* S2 — Script generating */}
            <motion.div style={{ opacity: s2Opacity }} className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-3xl">
                <div className="mb-5 flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 border border-[#CA8A04]/25 rounded-full px-3 py-1 bg-[#CA8A04]/5 text-[#CA8A04]/80 text-[10px] font-bold tracking-[0.2em] uppercase font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04] gold-pulse" />
                    Screenplay engine · GPT-4o
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">pipeline · step 02</span>
                </div>
                <div className="rounded-2xl border border-[#CA8A04]/20 bg-[#1C1917]/70 backdrop-blur-sm p-8 shadow-[0_0_60px_rgba(202,138,4,0.08)]">
                  <div className="flex items-baseline justify-between mb-5">
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Generating script…</h3>
                    <motion.span className="font-mono text-[#FDE68A] text-sm tracking-[0.2em]">{scriptPct}</motion.span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 w-full rounded-full bg-white/5 overflow-hidden border border-[#CA8A04]/15">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: scriptWidth,
                        background: 'linear-gradient(90deg, #92400e 0%, #CA8A04 50%, #FDE68A 100%)',
                        boxShadow: '0 0 24px rgba(202,138,4,0.6)',
                      }}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      style={{ backgroundSize: '200% 100%', animation: 'shimmer 2.4s linear infinite' }}
                    />
                  </div>

                  {/* Telemetry */}
                  <div className="mt-6 grid grid-cols-3 gap-4 font-mono text-[10px] tracking-[0.2em] uppercase">
                    <div className="border border-[#44403C]/60 rounded-lg px-3 py-2 bg-[#0c0a09]/40">
                      <div className="text-white/30">Beats</div>
                      <motion.div className="text-[#FDE68A] mt-1">{telBeats}</motion.div>
                    </div>
                    <div className="border border-[#44403C]/60 rounded-lg px-3 py-2 bg-[#0c0a09]/40">
                      <div className="text-white/30">Scenes</div>
                      <motion.div className="text-[#FDE68A] mt-1">{telScenes}</motion.div>
                    </div>
                    <div className="border border-[#44403C]/60 rounded-lg px-3 py-2 bg-[#0c0a09]/40">
                      <div className="text-white/30">Tokens</div>
                      <motion.div className="text-[#FDE68A] mt-1">{telTokens}</motion.div>
                    </div>
                  </div>

                  {/* Live log */}
                  <div className="mt-5 font-mono text-[10px] text-white/35 space-y-1 leading-relaxed max-h-20 overflow-hidden">
                    <div>› outline.draft() → &quot;Act I: The discovery&quot;</div>
                    <div>› character.design(&quot;detective_ishii&quot;) ✓</div>
                    <div>› dialogue.pass(tone=noir, era=1947) <span className="text-[#FDE68A]">…</span></div>
                    <div>› scene.graph.commit() → 8 nodes</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* S3+S4 — Scene 01 shrinks up, storyboard cards slide in below */}
            <motion.div style={{ opacity: sceneWrapOp }} className="absolute inset-0">
              {/* Scene 01 — starts centered, shrinks and rises */}
              <motion.div
                style={{ scale: scene1Scale, y: scene1Y }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-full max-w-3xl">
                  <motion.div style={{ opacity: s3LabelOp }}>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="inline-flex items-center gap-2 border border-[#CA8A04]/25 rounded-full px-3 py-1 bg-[#CA8A04]/5 text-[#CA8A04]/80 text-[10px] font-bold tracking-[0.2em] uppercase font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04]" />
                        Scene 01 · assembled
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">Gemini Flash · Vision</span>
                    </div>
                  </motion.div>
                  <SceneFrame title="Scene 01 · The Discovery" hue={28} scene="noir" progress={scrollYProgress} delay={0.48} />
                  <motion.div style={{ opacity: s3LabelOp }}>
                    <div className="mt-4 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40 flex items-center justify-between">
                      <span>Int. Shoya-machi apartment · Night</span>
                      <span>Duration 00:42</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Storyboard cards — slide up from bottom */}
              <motion.div style={{ opacity: s4CardsOp }} className="absolute inset-x-0 bottom-[10%] flex items-end justify-center">
                <div className="w-full max-w-5xl px-6">
                  <motion.div style={{ opacity: s4LabelOp }}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="inline-flex items-center gap-2 border border-[#CA8A04]/25 rounded-full px-3 py-1 bg-[#CA8A04]/5 text-[#CA8A04]/80 text-[10px] font-bold tracking-[0.2em] uppercase font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04] gold-pulse" />
                        Storyboard · 04 of 08
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">continuity pass</span>
                    </div>
                  </motion.div>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <motion.div style={{ y: s4y1 }}>
                      <SceneFrame title="Scene 02 · Neon Alleyway" hue={20} scene="city" progress={scrollYProgress} delay={0.62} />
                    </motion.div>
                    <motion.div style={{ y: s4y2 }}>
                      <SceneFrame title="Scene 03 · The Informant" hue={32} scene="interior" progress={scrollYProgress} delay={0.64} />
                    </motion.div>
                    <motion.div style={{ y: s4y3 }}>
                      <SceneFrame title="Scene 04 · Final Cut" hue={14} scene="noir" progress={scrollYProgress} delay={0.66} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* S5 — Your movie is ready */}
            <motion.div style={{ opacity: s5Opacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="text-center pointer-events-auto px-6">
                <div className="mb-6 inline-flex items-center gap-2 border border-[#CA8A04]/30 rounded-full px-4 py-1.5 bg-[#CA8A04]/10 text-[#FDE68A] text-[10px] font-bold tracking-[0.3em] uppercase font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04] gold-pulse" />
                  Render complete
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2 leading-[0.95]">
                  Your movie is{' '}
                  <span className="bg-gradient-to-br from-[#FDE68A] via-[#CA8A04] to-[#92400e] bg-clip-text text-transparent movie-title-glow">
                    ready
                  </span>
                </h2>
                <div className="text-3xl md:text-5xl font-black tracking-tighter text-white/90 mb-6 leading-[0.95]">
                  in{' '}
                  <span className="font-mono bg-gradient-to-br from-[#FDE68A] via-[#CA8A04] to-[#92400e] bg-clip-text text-transparent movie-title-glow">
                    3 min 18 sec
                  </span>
                </div>
                <p className="text-white/50 max-w-lg mx-auto mb-10 font-mono text-[11px] tracking-[0.25em] uppercase">
                  8 scenes · original score · one cut
                </p>
                <motion.button
                  style={{ scale: playScale, opacity: playOp }}
                  className="group relative w-28 h-28 rounded-full flex items-center justify-center cursor-pointer mx-auto"
                >
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, #FDE68A 0%, #CA8A04 40%, #92400e 80%)',
                      boxShadow: '0 0 60px rgba(253,230,138,0.5), 0 0 100px rgba(202,138,4,0.6), 0 0 160px rgba(202,138,4,0.3)',
                    }}
                  />
                  <span className="absolute inset-0 rounded-full border-2 border-[#FDE68A]/60 gold-pulse" />
                  <svg viewBox="0 0 24 24" className="relative z-10 w-12 h-12 translate-x-0.5 text-[#0c0a09] drop-shadow-[0_0_8px_rgba(253,230,138,0.4)]" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.button>
                <div className="mt-6 font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
                  Tap to play · or scroll for more
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Bottom timecode bar */}
        <div className="absolute bottom-6 left-0 right-0 px-8 z-30">
          <div className="max-w-5xl mx-auto flex items-center justify-between font-mono text-[10px] tracking-[0.3em] uppercase text-white/30">
            <span>TC 01:00:{String(Math.floor((stage - 1) * 12)).padStart(2, '0')}:00</span>
            <span className="text-[#CA8A04]/60">scroll to direct ↓</span>
            <span>REEL · 01</span>
          </div>
        </div>
      </div>
    </section>
  )
}
