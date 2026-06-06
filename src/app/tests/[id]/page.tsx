"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import AppShell from "@/components/AppShell"

const SKILL_LABEL: Record<string, string> = {
  reading: "O'qish",
  listening: "Tinglash",
  writing: "Yozish",
  speaking: "Gapirish",
}

type Question = {
  id: string
  skill: string
  level: string
  prompt: string
  passage: string | null
  audioUrl: string | null
  options: string[] | null
  points: number
}
type TestMeta = { id: string; title: string; skill: string; durationMin: number }

export default function TestPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}

function Content() {
  const params = useParams()
  const id = String(params?.id || "")
  const [test, setTest] = useState<TestMeta | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [authErr, setAuthErr] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/tests/${id}`)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true)
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (!d) return
        setTest(d.test)
        setQuestions(d.questions || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const start = async () => {
    setStarting(true)
    try {
      const r = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: id }),
      })
      if (r.status === 401) {
        setAuthErr(true)
        return
      }
      const d = await r.json()
      setAttemptId(d.attempt?.id || null)
    } catch {
      // ignore
    } finally {
      setStarting(false)
    }
  }

  if (loading) return <div className="card mx-auto max-w-2xl text-center text-muted">Yuklanmoqda...</div>

  if (notFound)
    return (
      <div className="card mx-auto max-w-xl space-y-3 text-center">
        <div className="text-5xl">🔍</div>
        <h2 className="text-xl font-bold text-fg">Test topilmadi</h2>
        <Link href="/tests" className="btn btn-primary mx-auto">Testlarga qaytish</Link>
      </div>
    )

  if (authErr)
    return (
      <div className="card mx-auto max-w-xl space-y-3 text-center">
        <div className="text-5xl">🔐</div>
        <h2 className="text-xl font-bold text-fg">Tizimga kiring</h2>
        <p className="text-muted">Testni boshlash uchun tizimga kiring.</p>
        <Link href="/login" className="btn btn-primary mx-auto">Kirish</Link>
      </div>
    )

  if (!test) return null

  const autoCheck = test.skill === "reading" || test.skill === "listening"

  if (!attemptId)
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Link href="/tests" className="text-sm text-muted hover:text-brand">← Testlar</Link>
        <div className="card card-glow space-y-4 text-center">
          <span className="badge badge-beta mx-auto">{SKILL_LABEL[test.skill] || test.skill}</span>
          <h1 className="text-2xl font-bold text-fg">{test.title}</h1>
          <div className="flex justify-center gap-6 text-sm text-muted">
            <span>📝 {questions.length} savol</span>
            <span>⏱ {test.durationMin} daqiqa</span>
          </div>
          {questions.length === 0 ? (
            <p className="text-muted">Bu testga hali savollar qo'shilmagan.</p>
          ) : (
            <button onClick={start} disabled={starting} className="btn btn-primary mx-auto">
              {starting ? "Boshlanmoqda..." : "Boshlash"}
            </button>
          )}
        </div>
      </div>
    )

  return autoCheck ? (
    <AutoRunner test={test} questions={questions} attemptId={attemptId} />
  ) : (
    <WritingRunner test={test} questions={questions} attemptId={attemptId} />
  )
}

function AutoRunner({ test, questions, attemptId }: { test: TestMeta; questions: Question[]; attemptId: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null)

  const submit = async () => {
    setSubmitting(true)
    try {
      const r = await fetch("/api/attempts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: questions.map((q) => ({ questionId: q.id, response: answers[q.id] ?? "" })),
        }),
      })
      const d = await r.json()
      setResult({ score: d.attempt?.score ?? 0, maxScore: d.attempt?.maxScore ?? 0 })
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0
    return (
      <div className="card card-glow mx-auto max-w-xl space-y-4 text-center">
        <div className="text-5xl">{pct >= 60 ? "🎉" : "💪"}</div>
        <h2 className="text-2xl font-bold gradient-text">{result.score} / {result.maxScore}</h2>
        <p className="text-muted">Natija: {pct}%</p>
        <p className="text-sm text-muted">Xato javoblar Xato jurnaliga qo'shildi va takror rejasiga olindi.</p>
        <div className="flex justify-center gap-3">
          <Link href="/error-log" className="btn btn-outline">Xato jurnali</Link>
          <Link href="/tests" className="btn btn-primary">Boshqa test</Link>
        </div>
      </div>
    )
  }

  const answered = Object.values(answers).filter(Boolean).length

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span className="font-semibold text-fg">{test.title}</span>
        <span>{answered} / {questions.length} belgilandi</span>
      </div>
      {questions.map((q, qi) => (
        <div key={q.id} className="card space-y-3">
          {q.passage && <p className="rounded-lg border border-line bg-fg/5 p-3 text-sm text-muted">{q.passage}</p>}
          {q.audioUrl && <audio controls src={q.audioUrl} className="w-full" />}
          <p className="font-semibold text-fg">{qi + 1}. {q.prompt}</p>
          <div className="space-y-2">
            {(q.options || []).map((opt) => {
              const active = answers[q.id] === opt
              return (
                <button
                  key={opt}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                  className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    active ? "border-brand bg-brand/10 text-fg" : "border-line text-muted hover:border-brand/50"
                  }`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <button onClick={submit} disabled={submitting} className="btn btn-primary w-full">
        {submitting ? "Tekshirilmoqda..." : "Yakunlash va tekshirish"}
      </button>
    </div>
  )
}

function WritingRunner({ test, questions, attemptId }: { test: TestMeta; questions: Question[]; attemptId: string }) {
  const q = questions[0]
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [limit, setLimit] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<{ score: number; maxScore: number; feedback: string; corrections?: unknown } | null>(null)

  if (!q)
    return (
      <div className="card mx-auto max-w-xl text-center text-muted">Bu testga hali savol qo'shilmagan.</div>
    )

  const submit = async () => {
    setSubmitting(true)
    setLimit(null)
    try {
      const r = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, questionId: q.id, response: text }),
      })
      if (r.status === 402) {
        const d = await r.json()
        setLimit(d.message || "Bepul AI baho limiti tugadi.")
        return
      }
      const d = await r.json()
      setEvaluation(d.evaluation || null)
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  if (evaluation) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="card card-glow space-y-3 text-center">
          <div className="text-5xl">🤖</div>
          <h2 className="text-2xl font-bold gradient-text">{evaluation.score} / {evaluation.maxScore}</h2>
          <p className="text-muted">AI bahosi</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">Fikr-mulohaza</p>
          <p className="whitespace-pre-wrap text-sm text-fg">{evaluation.feedback}</p>
        </div>
        <div className="flex justify-center gap-3">
          <Link href="/tests" className="btn btn-outline">Boshqa test</Link>
          <Link href="/dashboard" className="btn btn-primary">Bosh panel</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span className="font-semibold text-fg">{test.title}</span>
        <span>{SKILL_LABEL[test.skill] || test.skill}</span>
      </div>
      <div className="card space-y-3">
        {q.passage && <p className="rounded-lg border border-line bg-fg/5 p-3 text-sm text-muted">{q.passage}</p>}
        <p className="font-semibold text-fg">{q.prompt}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Javobingizni shu yerga yozing..."
          className="w-full rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-fg outline-none transition focus:border-brand"
        />
        <p className="text-right text-xs text-muted">{text.trim().split(/\s+/).filter(Boolean).length} so'z</p>
      </div>
      {limit && (
        <div className="card space-y-2 border-amber-500/40 text-center">
          <p className="text-sm text-amber-500">{limit}</p>
          <Link href="/pricing" className="btn btn-primary mx-auto">Premium olish</Link>
        </div>
      )}
      <button onClick={submit} disabled={submitting || text.trim().length < 5} className="btn btn-primary w-full">
        {submitting ? "AI baholamoqda..." : "Baholashga yuborish"}
      </button>
    </div>
  )
}
