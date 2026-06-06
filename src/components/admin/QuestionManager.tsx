"use client"
import { useCallback, useEffect, useState } from "react"

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
const SKILLS = [
  { v: "reading", l: "O'qish" },
  { v: "listening", l: "Tinglash" },
  { v: "writing", l: "Yozish" },
  { v: "speaking", l: "Gapirish" },
]
const skillLabel = (v: string) => SKILLS.find((s) => s.v === v)?.l || v
const autoCheck = (skill: string) => skill === "reading" || skill === "listening"
const inputCls =
  "w-full rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-fg outline-none transition focus:border-brand"

type Cert = { id: string; name: string; level: string; language?: { name: string } }
type Q = {
  id: string
  certificateId: string
  skill: string
  level: string
  prompt: string
  passage: string | null
  audioUrl: string | null
  options: unknown
  correctAnswer: unknown
  rubric: string | null
  points: number
  certificate?: { name: string }
}

export default function QuestionManager({ certificates }: { certificates: Cert[] }) {
  const [fCert, setFCert] = useState("")
  const [fSkill, setFSkill] = useState("")
  const [fLevel, setFLevel] = useState("")
  const [questions, setQuestions] = useState<Q[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [editing, setEditing] = useState<Q | null>(null)
  const [showForm, setShowForm] = useState(false)

  const emptyForm = {
    certificateId: certificates[0]?.id || "",
    skill: "reading",
    level: "B1",
    prompt: "",
    passage: "",
    audioUrl: "",
    optionsText: "",
    correctAnswer: "",
    rubric: "",
    points: 1,
  }
  const [form, setForm] = useState(emptyForm)
  const upd = (patch: Partial<typeof emptyForm>) => setForm((f) => ({ ...f, ...patch }))

  const load = useCallback(async () => {
    setLoading(true)
    setErr("")
    try {
      const p = new URLSearchParams()
      if (fCert) p.set("certificateId", fCert)
      if (fSkill) p.set("skill", fSkill)
      if (fLevel) p.set("level", fLevel)
      const r = await fetch(`/api/admin/questions?${p.toString()}`)
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Xatolik")
      setQuestions(d.questions || [])
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik")
    } finally {
      setLoading(false)
    }
  }, [fCert, fSkill, fLevel])

  useEffect(() => {
    load()
  }, [load])

  const del = async (id: string) => {
    if (!confirm("Savol o'chirilsinmi?")) return
    const r = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" })
    if (r.ok) load()
    else {
      const d = await r.json().catch(() => ({}))
      setErr(d.error || "O'chirib bo'lmadi")
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }
  const openEdit = (q: Q) => {
    setEditing(q)
    setForm({
      certificateId: q.certificateId,
      skill: q.skill,
      level: q.level,
      prompt: q.prompt,
      passage: q.passage || "",
      audioUrl: q.audioUrl || "",
      optionsText: Array.isArray(q.options) ? (q.options as string[]).join("\n") : "",
      correctAnswer:
        q.correctAnswer == null
          ? ""
          : typeof q.correctAnswer === "string"
            ? q.correctAnswer
            : JSON.stringify(q.correctAnswer),
      rubric: q.rubric || "",
      points: q.points,
    })
    setShowForm(true)
  }

  const save = async () => {
    setErr("")
    if (!form.certificateId || !form.prompt) {
      setErr("Sertifikat va savol matni majburiy")
      return
    }
    const options = autoCheck(form.skill)
      ? form.optionsText.split("\n").map((s) => s.trim()).filter(Boolean)
      : null
    const payload = {
      certificateId: form.certificateId,
      skill: form.skill,
      level: form.level,
      prompt: form.prompt,
      passage: form.passage || null,
      audioUrl: form.audioUrl || null,
      options,
      correctAnswer: autoCheck(form.skill) ? form.correctAnswer || null : null,
      rubric: !autoCheck(form.skill) ? form.rubric || null : null,
      points: Number(form.points) || 1,
    }
    const url = editing ? `/api/admin/questions/${editing.id}` : "/api/admin/questions"
    const method = editing ? "PATCH" : "POST"
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) {
      setErr(d.error || "Saqlashda xatolik")
      return
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  if (certificates.length === 0) {
    return (
      <div className="card mt-6 text-center text-muted">
        Avval “Testlar va sertifikatlar” bo'limida sertifikat qo'shing.
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="card flex flex-wrap items-end gap-3">
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs text-muted">Sertifikat</label>
          <select className={inputCls} value={fCert} onChange={(e) => setFCert(e.target.value)}>
            <option value="">Barchasi</option>
            {certificates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[130px]">
          <label className="mb-1 block text-xs text-muted">Ko'nikma</label>
          <select className={inputCls} value={fSkill} onChange={(e) => setFSkill(e.target.value)}>
            <option value="">Barchasi</option>
            {SKILLS.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[100px]">
          <label className="mb-1 block text-xs text-muted">Daraja</label>
          <select className={inputCls} value={fLevel} onChange={(e) => setFLevel(e.target.value)}>
            <option value="">Barchasi</option>
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Savol qo'shish
        </button>
      </div>

      {err && <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{err}</div>}

      <div className="space-y-2">
        {loading && <div className="card text-center text-muted">Yuklanmoqda...</div>}
        {!loading &&
          questions.map((q) => (
            <div key={q.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-beta">{q.level}</span>
                  <span className="badge badge-soon">{skillLabel(q.skill)}</span>
                  <span className="text-xs text-muted">
                    {q.certificate?.name} · {q.points} ball
                  </span>
                </div>
                <p className="mt-1.5 truncate text-fg">{q.prompt}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className="btn btn-outline text-xs" onClick={() => openEdit(q)}>
                  Tahrirlash
                </button>
                <button className="text-xs text-muted transition hover:text-red-500" onClick={() => del(q.id)}>
                  O'chirish
                </button>
              </div>
            </div>
          ))}
        {!loading && questions.length === 0 && (
          <div className="card text-center text-muted">Savol topilmadi.</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div
            className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-fg">{editing ? "Savolni tahrirlash" : "Yangi savol"}</h3>
            <div className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-muted">Sertifikat</label>
                  <select className={inputCls} value={form.certificateId} onChange={(e) => upd({ certificateId: e.target.value })}>
                    {certificates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">Ko'nikma</label>
                  <select className={inputCls} value={form.skill} onChange={(e) => upd({ skill: e.target.value })}>
                    {SKILLS.map((s) => (
                      <option key={s.v} value={s.v}>
                        {s.l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">Daraja</label>
                  <select className={inputCls} value={form.level} onChange={(e) => upd({ level: e.target.value })}>
                    {LEVELS.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Savol matni / topshiriq</label>
                <textarea className={inputCls} rows={2} value={form.prompt} onChange={(e) => upd({ prompt: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">O'qish/eshitish matni (ixtiyoriy)</label>
                <textarea className={inputCls} rows={3} value={form.passage} onChange={(e) => upd({ passage: e.target.value })} />
              </div>
              {form.skill === "listening" && (
                <div>
                  <label className="mb-1 block text-xs text-muted">Audio URL</label>
                  <input className={inputCls} value={form.audioUrl} onChange={(e) => upd({ audioUrl: e.target.value })} placeholder="https://..." />
                </div>
              )}
              {autoCheck(form.skill) ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted">Variantlar (har qatorda bittadan)</label>
                    <textarea
                      className={inputCls}
                      rows={4}
                      value={form.optionsText}
                      onChange={(e) => upd({ optionsText: e.target.value })}
                      placeholder="Variant A&#10;Variant B&#10;Variant C"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted">To'g'ri javob</label>
                    <input
                      className={inputCls}
                      value={form.correctAnswer}
                      onChange={(e) => upd({ correctAnswer: e.target.value })}
                      placeholder="masalan: Variant B"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs text-muted">Baholash mezoni (AI yozma/og'zaki baholash uchun)</label>
                  <textarea className={inputCls} rows={3} value={form.rubric} onChange={(e) => upd({ rubric: e.target.value })} />
                </div>
              )}
              <div className="w-32">
                <label className="mb-1 block text-xs text-muted">Ball</label>
                <input className={inputCls} type="number" value={form.points} onChange={(e) => upd({ points: Number(e.target.value) })} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>
                Bekor qilish
              </button>
              <button className="btn btn-primary" onClick={save}>
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
