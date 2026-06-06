"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"

const REVIEW_STEPS = ["1 soat", "1 kun", "3 kun", "1 hafta", "1 oy"]

type Item = {
  id: string
  status: string
  repetition: number
  topic: string
  tags: string[]
  question: string
  yourAnswer: string
  correctAnswer: string
  explanation: string
  nextReview: string
  due: boolean
}
type Stats = { total: number; mastered: number; dueToday: number; topTopic: string }
type Topic = { topic: string; count: number }
type Filter = "all" | "active" | "mastered"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Hammasi" },
  { id: "active", label: "Faol" },
  { id: "mastered", label: "O'zlashtirilgan" },
]

export default function ErrorLogPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}

function Content() {
  const [items, setItems] = useState<Item[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [authErr, setAuthErr] = useState(false)
  const [filter, setFilter] = useState<Filter>("all")

  useEffect(() => {
    fetch("/api/error-log")
      .then(async (r) => {
        if (r.status === 401) {
          setAuthErr(true)
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (!d) return
        setItems(d.items || [])
        setStats(d.stats || null)
        setTopics(d.topics || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (authErr)
    return (
      <div className="card mx-auto max-w-md space-y-3 text-center">
        <div className="text-5xl">🔐</div>
        <h2 className="text-xl font-bold text-fg">Tizimga kiring</h2>
        <p className="text-muted">Xato jurnalingizni ko'rish uchun tizimga kiring.</p>
        <Link href="/login" className="btn btn-primary mx-auto">Kirish</Link>
      </div>
    )

  if (loading) return <div className="card text-center text-muted">Yuklanmoqda...</div>

  const shown = items.filter((e) => (filter === "all" ? true : e.status === filter))
  const dueCount = stats?.dueToday || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg">🔁 Aqlli Xato Jurnali</h1>
          <p className="text-muted">Har bir xato — yangi imkoniyat. Spaced repetition bilan mustahkamlang.</p>
        </div>
        {dueCount > 0 && (
          <Link href="/review" className="btn btn-primary">▶ Bugungi takror ({dueCount})</Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card mx-auto max-w-md space-y-3 text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="text-lg font-bold text-fg">Xatolar yo'q!</h2>
          <p className="text-muted">Test ishlaganingizda xato javoblar shu yerga yig'iladi va takrorlash uchun rejaga olinadi.</p>
          <Link href="/tests" className="btn btn-primary mx-auto">Test ishlash</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Jami xatolar" value={String(stats?.total ?? 0)} />
            <Stat label="O'zlashtirilgan" value={String(stats?.mastered ?? 0)} />
            <Stat label="Bugun takrorlash" value={String(dueCount)} />
            <Stat label="Eng ko'p xato" value={stats?.topTopic ?? "\u2014"} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`rounded-lg border border-line px-3 py-1.5 text-sm transition ${
                      filter === f.id ? "bg-brand/15 text-brand" : "text-muted hover:text-fg"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {shown.map((e) => (
                <ErrorCard key={e.id} item={e} />
              ))}
              {shown.length === 0 && (
                <div className="card text-center text-muted">Bu filtrda xato yo'q.</div>
              )}
            </div>

            <div className="space-y-6">
              <TopicCard topics={topics} />
              <LadderCard />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold gradient-text">{value}</p>
    </div>
  )
}

function Ladder({ rep }: { rep: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {REVIEW_STEPS.map((s, i) => (
        <div key={s} title={s} className={`h-1.5 w-6 rounded-full ${i < rep ? "bg-brand" : "bg-fg/10"}`} />
      ))}
    </div>
  )
}

function ErrorCard({ item }: { item: Item }) {
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tg) => (
            <span key={tg} className="rounded-md border border-line bg-brand/10 px-2 py-0.5 text-xs text-fg">{tg}</span>
          ))}
        </div>
        <span className={`badge ${item.status === "mastered" ? "badge-live" : "badge-beta"}`}>
          {item.status === "mastered" ? "O'zlashtirilgan" : "Faol"}
        </span>
      </div>

      <p className="font-semibold text-fg">{item.question}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-fg/5 p-2">
          <p className="text-xs text-muted">Sizning javobingiz</p>
          <p className="text-sm text-rose-500 line-through">{item.yourAnswer}</p>
        </div>
        <div className="rounded-lg border border-line bg-fg/5 p-2">
          <p className="text-xs text-muted">To'g'ri javob</p>
          <p className="text-sm font-medium text-emerald-500">{item.correctAnswer}</p>
        </div>
      </div>

      <details>
        <summary className="cursor-pointer text-sm font-medium text-brand">🤖 AI tushuntirish</summary>
        <p className="mt-2 text-sm text-muted">{item.explanation}</p>
      </details>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <Ladder rep={item.repetition} />
        <span className="text-xs text-muted">Keyingi takror: <span className="text-fg">{item.nextReview}</span></span>
      </div>
    </div>
  )
}

function TopicCard({ topics }: { topics: Topic[] }) {
  const max = Math.max(1, ...topics.map((t) => t.count))
  return (
    <div className="card">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Mavzular bo'yicha</p>
      {topics.length === 0 ? (
        <p className="text-sm text-muted">Hali ma'lumot yo'q.</p>
      ) : (
        <div className="space-y-3">
          {topics.map((tp) => (
            <div key={tp.topic}>
              <div className="flex justify-between text-sm">
                <span className="text-fg">{tp.topic}</span>
                <span className="text-muted">{tp.count}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-fg/10">
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand2" style={barStyle((tp.count / max) * 100)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LadderCard() {
  return (
    <div className="card">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Takror bosqichlari</p>
      <ol className="space-y-2 text-sm text-muted">
        {REVIEW_STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/10 text-xs font-semibold text-brand">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted">To'g'ri javob bersangiz keyingi bosqichga o'tadi. 5 bosqichdan keyin “O'zlashtirilgan” bo'ladi.</p>
    </div>
  )
}

const barStyle = (pct: number) => ({ width: `${Math.max(4, Math.min(100, pct))}%` })
