"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"

type Skill = { skill: string; label: string; accuracy: number; band: number; hasData: boolean }
type Course = { name: string; flag: string; level: string; progress: number }
type Badge = { icon: string; label: string; earned: boolean }
type Data = {
  user: {
    name: string
    plan: string
    targetLevel: string
    learningLang: { name: string; flag: string | null } | null
    examInDays: number | null
    streak: number
    xp: number
  }
  skills: Skill[]
  courses: Course[]
  heatmap: number[]
  review: { dueToday: number; mastered: number; total: number }
  badges: Badge[]
  totalAttempts: number
}

export default function DashboardPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}

function Content() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [authErr, setAuthErr] = useState(false)

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (r) => {
        if (r.status === 401) {
          setAuthErr(true)
          return null
        }
        return r.json()
      })
      .then((d) => d && setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (authErr)
    return (
      <div className="card mx-auto max-w-md space-y-3 text-center">
        <div className="text-5xl">🔐</div>
        <h2 className="text-xl font-bold text-fg">Tizimga kiring</h2>
        <p className="text-muted">Bosh panelni ko'rish uchun tizimga kiring.</p>
        <Link href="/login" className="btn btn-primary mx-auto">Kirish</Link>
      </div>
    )

  if (loading || !data) return <div className="card text-center text-muted">Yuklanmoqda...</div>

  const u = data.user
  const langFlag = u.learningLang?.flag || "\ud83c\udf10"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Salom, {u.name} 👋</h1>
        <p className="text-muted">Bugun ham bir qadam oldinga — davom etamiz!</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Maqsad daraja" value={`${u.targetLevel} ${langFlag}`} />
        <Stat label="Imtihongacha" value={u.examInDays != null ? `${u.examInDays} kun` : "\u2014"} />
        <Stat label="Streak" value={`🔥 ${u.streak}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <XpCard xp={u.xp} plan={u.plan} attempts={data.totalAttempts} />
          <CoursesCard courses={data.courses} />
          <MockTestCard />
        </div>
        <div className="space-y-6">
          <AnalyticsCard skills={data.skills} />
          <RadarCard skills={data.skills} />
          <DailyReviewCard review={data.review} />
          <HeatmapCard heatmap={data.heatmap} />
          <BadgesCard badges={data.badges} />
        </div>
      </div>
    </div>
  )
}

/* ---------- shared ---------- */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold gradient-text">{value}</p>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{children}</p>
}

const pctStyle = (pct: number) => ({ width: `${Math.max(0, Math.min(100, pct))}%` })

/* ---------- left: XP ---------- */
function XpCard({ xp, plan, attempts }: { xp: number; plan: string; attempts: number }) {
  return (
    <div className="card card-glow">
      <SectionTitle>Umumiy holat</SectionTitle>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold gradient-text">{xp}</p>
          <p className="text-xs text-muted">XP</p>
        </div>
        <div>
          <p className="text-2xl font-bold gradient-text">{attempts}</p>
          <p className="text-xs text-muted">Test</p>
        </div>
        <div>
          <span className={`badge ${plan === "premium" ? "badge-live" : "badge-beta"}`}>
            {plan === "premium" ? "Premium" : "Bepul"}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ---------- left: courses ---------- */
function CoursesCard({ courses }: { courses: Course[] }) {
  return (
    <div>
      <SectionTitle>Kurslarim</SectionTitle>
      {courses.length === 0 ? (
        <div className="card text-center text-sm text-muted">
          Hali test ishlamadingiz. <Link href="/tests" className="text-brand">Boshlash</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {courses.map((c) => (
            <div key={c.name} className="card">
              <div className="text-2xl">{c.flag}</div>
              <p className="mt-2 font-semibold text-fg">{c.name}</p>
              <p className="text-xs text-muted">{c.level} · {c.progress}%</p>
              <div className="progress-track mt-3">
                <div className="progress-fill" style={pctStyle(c.progress)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- left: mock test ---------- */
function MockTestCard() {
  return (
    <div className="card card-glow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-fg">🧪 Mock Test</p>
          <p className="mt-1 text-sm text-muted">Telc, Goethe-Zertifikat va boshqalar. To'liq imtihon simulyatsiyasi.</p>
        </div>
        <Link href="/tests" className="btn btn-primary shrink-0">Boshlash</Link>
      </div>
    </div>
  )
}

/* ---------- right: analytics rings ---------- */
function Ring({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const r = 24
  const c = 2 * Math.PI * r
  const dash = `${((value / max) * c).toFixed(1)} ${c.toFixed(1)}`
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 64" className="h-14 w-14 -rotate-90">
        <circle cx="32" cy="32" r={r} className="fill-none stroke-line" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} className={`fill-none ${color}`} strokeWidth="6" strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      <div>
        <p className="text-sm text-fg">{label}</p>
        <p className="text-lg font-bold gradient-text">{value.toFixed(1)}</p>
      </div>
    </div>
  )
}

const RING_COLORS: Record<string, string> = {
  listening: "stroke-sky-400",
  reading: "stroke-emerald-400",
  writing: "stroke-amber-400",
  speaking: "stroke-rose-400",
}

function AnalyticsCard({ skills }: { skills: Skill[] }) {
  const has = skills.some((s) => s.hasData)
  return (
    <div className="card">
      <SectionTitle>Bilim darajasi analitikasi</SectionTitle>
      {!has ? (
        <p className="text-sm text-muted">Test ishlaganingizdan so'ng skill darajangiz shu yerda ko'rinadi.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {skills.map((s) => (
            <Ring key={s.skill} label={s.label} value={s.band} max={9} color={RING_COLORS[s.skill] || "stroke-brand"} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- right: radar ---------- */
function radarPoint(i: number, total: number, v: number, cx: number, cy: number, r: number): [number, number] {
  const ang = (Math.PI * 2 * i) / total - Math.PI / 2
  return [cx + Math.cos(ang) * r * v, cy + Math.sin(ang) * r * v]
}

function RadarCard({ skills }: { skills: Skill[] }) {
  const cx = 70
  const cy = 70
  const r = 52
  const axes = skills.map((s) => ({ key: s.label.charAt(0), val: s.accuracy / 100 }))
  const total = axes.length
  const toStr = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`
  const pts = axes.map((a, i) => toStr(radarPoint(i, total, a.val, cx, cy, r))).join(" ")
  const ring = (v: number) => axes.map((_, i) => toStr(radarPoint(i, total, v, cx, cy, r))).join(" ")
  return (
    <div className="card">
      <SectionTitle>Skill breakdown</SectionTitle>
      <svg viewBox="0 0 140 140" className="mx-auto h-44 w-44">
        {[0.33, 0.66, 1].map((v) => (
          <polygon key={v} points={ring(v)} className="fill-none stroke-line" strokeWidth="1" />
        ))}
        {axes.map((a, i) => {
          const p = radarPoint(i, total, 1, cx, cy, r)
          return <line key={a.key + i} x1={cx} y1={cy} x2={p[0].toFixed(1)} y2={p[1].toFixed(1)} className="stroke-line" strokeWidth="1" />
        })}
        <polygon points={pts} className="fill-brand/25 stroke-brand" strokeWidth="2" />
        {axes.map((a, i) => {
          const p = radarPoint(i, total, 1.2, cx, cy, r)
          return (
            <text key={a.key + i} x={p[0].toFixed(1)} y={p[1].toFixed(1)} className="fill-muted text-[9px]" textAnchor="middle" dominantBaseline="middle">{a.key}</text>
          )
        })}
      </svg>
    </div>
  )
}

/* ---------- right: daily review ---------- */
function DailyReviewCard({ review }: { review: { dueToday: number; mastered: number; total: number } }) {
  return (
    <div className="card card-glow flex items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-brand/40">
          <span className="text-xl font-bold gradient-text">{review.dueToday}</span>
        </div>
        <div>
          <p className="font-semibold text-fg">Bugungi takror</p>
          <p className="text-sm text-muted">{review.dueToday > 0 ? `${review.dueToday} ta savol kutmoqda` : "Bugun takror yo'q \u2705"}</p>
        </div>
      </div>
      <Link href="/review" className="btn btn-primary shrink-0">Boshlash</Link>
    </div>
  )
}

/* ---------- right: heatmap ---------- */
function HeatmapCard({ heatmap }: { heatmap: number[] }) {
  const max = Math.max(1, ...heatmap)
  const shadeFor = (c: number) => {
    if (c === 0) return "bg-fg/5"
    const ratio = c / max
    if (ratio > 0.75) return "bg-brand/90"
    if (ratio > 0.5) return "bg-brand/65"
    if (ratio > 0.25) return "bg-brand/45"
    return "bg-brand/25"
  }
  const total = heatmap.reduce((a, b) => a + b, 0)
  return (
    <div className="card">
      <SectionTitle>Xatolar issiqlik xaritasi</SectionTitle>
      <p className="mb-3 text-xs text-muted">Oxirgi 30 kun · jami {total} ta xato</p>
      <div className="flex flex-wrap gap-1">
        {heatmap.map((c, i) => (
          <div key={i} title={`${c} xato`} className={`h-3.5 w-3.5 rounded-sm ${shadeFor(c)}`} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <span>Kam</span>
        <div className="h-3 w-3 rounded-sm bg-brand/25" />
        <div className="h-3 w-3 rounded-sm bg-brand/45" />
        <div className="h-3 w-3 rounded-sm bg-brand/65" />
        <div className="h-3 w-3 rounded-sm bg-brand/90" />
        <span>Ko'p</span>
      </div>
    </div>
  )
}

/* ---------- right: badges ---------- */
function BadgesCard({ badges }: { badges: Badge[] }) {
  return (
    <div className="card">
      <SectionTitle>Yutuqlar</SectionTitle>
      <div className="flex items-center justify-between gap-2">
        {badges.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1">
            <div className={`grid h-11 w-11 place-items-center rounded-full border border-line text-xl ${b.earned ? "bg-brand/10" : "bg-fg/5 opacity-40 grayscale"}`}>{b.icon}</div>
            <span className="text-center text-[10px] text-muted">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
