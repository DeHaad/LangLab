"use client"
import { useEffect, useMemo, useState } from "react"
import AppShell from "@/components/AppShell"
import { useLang } from "@/lib/LangContext"

type Card = {
  id: string
  word: string
  translation: string
  example: string | null
  topic: string | null
  level: string
}
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]

export default function VocabPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}

function Content() {
  const { t } = useLang()
  const [all, setAll] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState("")
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    fetch("/api/vocabulary")
      .then((r) => r.json())
      .then((d) => setAll(d.vocabulary || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const deck = useMemo(() => (level ? all.filter((c) => c.level === level) : all), [all, level])

  useEffect(() => {
    setIdx(0)
    setFlipped(false)
  }, [level])

  const empty = deck.length === 0
  const card = empty ? null : deck[idx % deck.length]
  const next = () => {
    setFlipped(false)
    setIdx((i) => (i + 1) % deck.length)
  }
  const prev = () => {
    setFlipped(false)
    setIdx((i) => (i - 1 + deck.length) % deck.length)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">📚 {t("nav.vocab")}</h1>
        <p className="text-muted">Flashcard usulida so'z yodlash.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setLevel("")}
          className={`badge ${level === "" ? "badge-live" : "badge-soon"}`}
        >
          Hammasi
        </button>
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`badge ${level === l ? "badge-live" : "badge-soon"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading && <div className="card text-center text-muted">Yuklanmoqda...</div>}

      {!loading && (empty || !card) ? (
        <div className="card mx-auto max-w-md space-y-3 text-center">
          <div className="text-5xl">🗂️</div>
          <h2 className="text-lg font-bold text-fg">Lug'at to'plami bo'sh</h2>
          <p className="text-muted">Admin panel orqali so'zlar qo'shilgach, ular shu yerda paydo bo'ladi.</p>
        </div>
      ) : null}

      {!loading && card && (
        <div className="mx-auto max-w-md">
          <div className="mb-2 flex justify-between text-xs text-muted">
            <span>{card.topic || "So'zlar"}</span>
            <span>{(idx % deck.length) + 1} / {deck.length}</span>
          </div>
          <button
            onClick={() => setFlipped((f) => !f)}
            className="card card-glow grid min-h-[12rem] w-full place-items-center text-center"
          >
            {!flipped ? (
              <span className="text-3xl font-bold text-fg">{card.word}</span>
            ) : (
              <span>
                <span className="block text-xl font-semibold text-brand">{card.translation}</span>
                {card.example && <span className="mt-3 block text-sm italic text-muted">{card.example}</span>}
              </span>
            )}
          </button>
          <div className="mt-4 flex gap-3">
            <button onClick={prev} className="btn btn-outline flex-1">← Oldingi</button>
            <button onClick={next} className="btn btn-primary flex-1">Keyingi →</button>
          </div>
        </div>
      )}
    </div>
  )
}
