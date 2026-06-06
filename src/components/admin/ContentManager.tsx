"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Icon from "@/components/Icon"

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
const SKILLS = [
  { v: "reading", l: "O'qish" },
  { v: "listening", l: "Tinglash" },
  { v: "writing", l: "Yozish" },
  { v: "speaking", l: "Gapirish" },
]
const skillLabel = (v: string) => SKILLS.find((s) => s.v === v)?.l || v
const inputCls =
  "w-full rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-fg outline-none transition focus:border-brand"

type Lang = { id: string; code: string; name: string; flag: string | null }
type Cert = {
  id: string
  code: string
  name: string
  level: string
  isActive: boolean
  languageId: string
  language?: Lang
  _count?: { questions: number; tests: number }
}
type Test = { id: string; certificateId: string; skill: string; title: string; durationMin: number }

export default function ContentManager({
  languages,
  certificates,
  tests,
}: {
  languages: Lang[]
  certificates: Cert[]
  tests: Test[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  const [lCode, setLCode] = useState("")
  const [lName, setLName] = useState("")
  const [lFlag, setLFlag] = useState("")

  const [cLang, setCLang] = useState("")
  const [cCode, setCCode] = useState("")
  const [cName, setCName] = useState("")
  const [cLevel, setCLevel] = useState("B1")

  const [openTest, setOpenTest] = useState<string | null>(null)
  const [tTitle, setTTitle] = useState("")
  const [tSkill, setTSkill] = useState("reading")
  const [tDur, setTDur] = useState(30)

  const api = async (url: string, method: string, body?: unknown) => {
    setErr("")
    setBusy(true)
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || "Xatolik")
      router.refresh()
      return true
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik")
      return false
    } finally {
      setBusy(false)
    }
  }

  const addLanguage = async () => {
    if (!lCode || !lName) return setErr("Til kodi va nomi kerak")
    if (await api("/api/admin/languages", "POST", { code: lCode, name: lName, flag: lFlag })) {
      setLCode("")
      setLName("")
      setLFlag("")
    }
  }
  const addCertificate = async () => {
    if (!cLang || !cCode || !cName) return setErr("Til, kod va nom kerak")
    if (
      await api("/api/admin/certificates", "POST", {
        languageId: cLang,
        code: cCode,
        name: cName,
        level: cLevel,
      })
    ) {
      setCCode("")
      setCName("")
    }
  }
  const addTest = async (certificateId: string) => {
    if (!tTitle) return setErr("Test nomi kerak")
    if (await api("/api/admin/tests", "POST", { certificateId, skill: tSkill, title: tTitle, durationMin: tDur })) {
      setTTitle("")
      setOpenTest(null)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {err && <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{err}</div>}

      <section className="card">
        <h2 className="flex items-center gap-2 font-semibold text-fg">
          <Icon name="languages" size={18} /> Tillar
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {languages.map((l) => (
            <span key={l.id} className="badge badge-soon">
              {l.flag || ""} {l.name} ({l.code})
            </span>
          ))}
          {languages.length === 0 && <span className="text-sm text-muted">Hozircha til yo'q</span>}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <input className={inputCls} placeholder="Kod (de)" value={lCode} onChange={(e) => setLCode(e.target.value)} />
          <input className={inputCls} placeholder="Nom (Nemis tili)" value={lName} onChange={(e) => setLName(e.target.value)} />
          <input className={inputCls} placeholder="Bayroq" value={lFlag} onChange={(e) => setLFlag(e.target.value)} />
          <button className="btn btn-primary" disabled={busy} onClick={addLanguage}>
            Til qo'shish
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-semibold text-fg">
          <Icon name="clipboard" size={18} /> Yangi sertifikat
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          <select className={inputCls} value={cLang} onChange={(e) => setCLang(e.target.value)}>
            <option value="">Til tanlang</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <input className={inputCls} placeholder="Kod (telc_b1)" value={cCode} onChange={(e) => setCCode(e.target.value)} />
          <input className={inputCls} placeholder="Nom (Telc B1)" value={cName} onChange={(e) => setCName(e.target.value)} />
          <select className={inputCls} value={cLevel} onChange={(e) => setCLevel(e.target.value)}>
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" disabled={busy} onClick={addCertificate}>
            Qo'shish
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {certificates.map((c) => {
          const ctests = tests.filter((t) => t.certificateId === c.id)
          return (
            <div key={c.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-fg">{c.name}</span>
                    <span className="badge badge-beta">{c.level}</span>
                    {!c.isActive && <span className="badge badge-soon">nofaol</span>}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    {c.language?.name} · {c._count?.questions ?? 0} savol · {ctests.length} test
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-outline text-xs"
                    disabled={busy}
                    onClick={() => api(`/api/admin/certificates/${c.id}`, "PATCH", { isActive: !c.isActive })}
                  >
                    {c.isActive ? "Nofaol qilish" : "Faollashtirish"}
                  </button>
                  <button
                    className="text-xs text-muted transition hover:text-red-500"
                    disabled={busy}
                    onClick={() => {
                      if (confirm("Sertifikat o'chirilsinmi?")) api(`/api/admin/certificates/${c.id}`, "DELETE")
                    }}
                  >
                    O'chirish
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {ctests.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-surface2 px-3 py-2 text-sm">
                    <span className="text-fg">
                      {t.title} <span className="text-muted">· {skillLabel(t.skill)} · {t.durationMin} daqiqa</span>
                    </span>
                    <button
                      className="text-xs text-muted transition hover:text-red-500"
                      disabled={busy}
                      onClick={() => {
                        if (confirm("Test o'chirilsinmi?")) api(`/api/admin/tests/${t.id}`, "DELETE")
                      }}
                    >
                      O'chirish
                    </button>
                  </div>
                ))}
                {ctests.length === 0 && <p className="text-xs text-muted">Test yo'q</p>}
              </div>

              {openTest === c.id ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  <input className={inputCls} placeholder="Test nomi" value={tTitle} onChange={(e) => setTTitle(e.target.value)} />
                  <select className={inputCls} value={tSkill} onChange={(e) => setTSkill(e.target.value)}>
                    {SKILLS.map((s) => (
                      <option key={s.v} value={s.v}>
                        {s.l}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputCls}
                    type="number"
                    placeholder="Daqiqa"
                    value={tDur}
                    onChange={(e) => setTDur(Number(e.target.value))}
                  />
                  <div className="flex gap-2">
                    <button className="btn btn-primary flex-1" disabled={busy} onClick={() => addTest(c.id)}>
                      Saqlash
                    </button>
                    <button className="btn btn-outline" onClick={() => setOpenTest(null)}>
                      Bekor
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-outline mt-3 text-xs"
                  onClick={() => {
                    setOpenTest(c.id)
                    setTTitle("")
                    setTSkill("reading")
                    setTDur(30)
                  }}
                >
                  + Test qo'shish
                </button>
              )}
            </div>
          )
        })}
        {certificates.length === 0 && (
          <div className="card text-center text-muted">Hozircha sertifikat yo'q. Yuqoridan qo'shing.</div>
        )}
      </section>
    </div>
  )
}
