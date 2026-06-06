"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"

type Item = {
  id: string
  topic: string
  tags: string[]
  question: string
  yourAnswer: string
  correctAnswer: string
  explanation: string
}

export default function ReviewPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}

const barStyle = (pct: number) => ({ width: `${Math.max(0, Math.min(100, pct))}%` })

function Content() {
  const [queue, setQueue] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [authErr, setAuthErr] = useState(false)
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [understood, setUnderstood] = useState(0)
  const [again, setAgain] = useState(0)
  const [done, setDone] = useState(false)

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
        const q = (d.items || []).filter((i: Item & { status: string; due: boolean }) => i.status === "active" && i.due).slice(0, 20)
        setQueue(q)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (authErr)
    return (
      <div className="card mx-auto max-w-xl space-y-3 text-center">
        <div className="text-5xl">🔐</div>
        <h2 className="text-xl font-bold text-fg">Tizimga kiring</h2>
        <Link href="/login" className="btn btn-primary mx-auto">Kirish</Link>
      </div>
    )

  if (loading) return <div className="card mx-auto max-w-xl text-center text-muted">Yuklanmoqda...</div>

  if (queue.length === 0)
    return (
      <div className="card mx-auto max-w-xl space-y-3 text-center">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-fg">Bugun takrorlash yo'q!</h2>
        <p className="text-muted">Hozircha takrorlash kerak bo'lgan xato yo'q. Zo'r ish!</p>
        <Link href="/dashboard" className="btn btn-primary mx-auto">Bosh panelga</Link>
      </div>
    )

  if (done)
    return (
      <div className="card card-glow mx-auto max-w-xl space-y-4 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-fg">Takror yakunlandi!</h2>
        <p className="text-muted">{understood} ta o'zlashtirildi · {again} ta keyinroq qaytadi</p>
        <div className="flex justify-center gap-3">
          <Link href="/error-log" className="btn btn-outline">Xato jurnali</Link>
          <Link href="/dashboard" className="btn btn-primary">Bosh panel</Link>
        </div>
      </div>
    )

  const item = queue[idx]
  const answer = (ok: boolean) => {
    if (ok) setUnderstood((v) => v + 1)
    else setAgain((v) => v + 1)
    fetch(`/api/error-log/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ understood: ok }),
    }).catch(() => {})
    if (idx + 1 < queue.length) {
      setIdx(idx + 1)
      setRevealed(false)
    } else {
      setDone(true)
    }
  }

  const pct = (idx / queue.length) * 100

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <Link href="/error-log" className="hover:text-brand">✕ Chiqish</Link>
        <span>Focus Mode · {idx + 1} / {queue.length}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-fg/10">
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand2 transition-all" style={barStyle(pct)} />
      </div>

      <div className="card card-glow space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.tags.map((tg) => (
            <span key={tg} className="rounded-md border border-line bg-brand/10 px-2 py-0.5 text-xs text-fg">{tg}</span>
          ))}
          <span className="ml-auto text-xs uppercase tracking-wide text-muted">{item.topic}</span>
        </div>

        <p className="text-xl font-semibold text-fg">{item.question}</p>

        {!revealed ? (
          <button onClick={() => setRevealed(true)} className="btn btn-primary w-full">Javobni ko'rish</button>
        ) : (
          <div className="space-y-4">
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
            <div className="rounded-xl border border-line bg-brand/5 p-3">
              <p className="text-sm font-medium text-brand">🤖 AI tushuntirish</p>
              <p className="mt-1 text-sm text-muted">{item.explanation}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => answer(false)} className="btn btn-outline">🔁 Yana ko'rsat</button>
              <button onClick={() => answer(true)} className="btn btn-primary">✅ Tushundim</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
