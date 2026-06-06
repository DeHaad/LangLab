"use client"
import { useCallback, useEffect, useRef, useState } from "react"

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
const inputCls =
  "w-full rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-fg outline-none transition focus:border-brand"

type Lang = { id: string; code: string; name: string }
type Vocab = {
  id: string
  languageId: string
  level: string
  word: string
  translation: string
  example: string | null
  topic: string | null
  language?: { name: string }
}

type ParsedRow = { word: string; translation: string; example: string | null; topic: string | null }

// CSV yoki Excel (tab) qatorlarini ajratish: word, translation, example, topic
function parseRows(text: string): ParsedRow[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const delimiter = line.includes("\t") ? "\t" : ","
      const parts = line.split(delimiter)
      return {
        word: (parts[0] || "").trim(),
        translation: (parts[1] || "").trim(),
        example: (parts[2] || "").trim() || null,
        topic: (parts[3] || "").trim() || null,
      }
    })
    .filter((r) => r.word && r.translation)
}

export default function VocabularyManager({ languages }: { languages: Lang[] }) {
  const [fLang, setFLang] = useState("")
  const [fLevel, setFLevel] = useState("")
  const [q, setQ] = useState("")
  const [items, setItems] = useState<Vocab[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [msg, setMsg] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setErr("")
    try {
      const p = new URLSearchParams()
      if (fLang) p.set("languageId", fLang)
      if (fLevel) p.set("level", fLevel)
      if (q) p.set("q", q)
      const r = await fetch(`/api/admin/vocabulary?${p.toString()}`)
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Xatolik")
      setItems(d.items || [])
      setTotal(d.total || 0)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik")
    } finally {
      setLoading(false)
    }
  }, [fLang, fLevel, q])

  useEffect(() => {
    load()
  }, [load])

  const del = async (id: string) => {
    if (!confirm("So'z o'chirilsinmi?")) return
    const r = await fetch(`/api/admin/vocabulary/${id}`, { method: "DELETE" })
    if (r.ok) load()
    else {
      const d = await r.json().catch(() => ({}))
      setErr(d.error || "O'chirib bo'lmadi")
    }
  }

  // ---- Bitta so'z qo'shish ----
  const [nLang, setNLang] = useState("")
  const [nLevel, setNLevel] = useState("A1")
  const [nWord, setNWord] = useState("")
  const [nTr, setNTr] = useState("")
  const [nEx, setNEx] = useState("")
  const [nTopic, setNTopic] = useState("")
  const [busy, setBusy] = useState(false)

  const addOne = async () => {
    setErr("")
    setMsg("")
    if (!nLang || !nWord || !nTr) {
      setErr("Til, so'z va tarjima majburiy")
      return
    }
    setBusy(true)
    try {
      const r = await fetch("/api/admin/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languageId: nLang,
          level: nLevel,
          word: nWord,
          translation: nTr,
          example: nEx,
          topic: nTopic,
        }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || "Xatolik")
      setNWord("")
      setNTr("")
      setNEx("")
      setNTopic("")
      setMsg("So'z qo'shildi")
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik")
    } finally {
      setBusy(false)
    }
  }

  // ---- Ommaviy import ----
  const [iLang, setILang] = useState("")
  const [iLevel, setILevel] = useState("A1")
  const [csv, setCsv] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const preview = parseRows(csv)

  const onFile = async (file: File | null) => {
    if (!file) return
    const text = await file.text()
    setCsv(text)
  }

  const runImport = async () => {
    setErr("")
    setMsg("")
    if (!iLang) {
      setErr("Import uchun til tanlang")
      return
    }
    if (preview.length === 0) {
      setErr("Yaroqli qator yo'q (har qatorda: so'z, tarjima, misol, mavzu)")
      return
    }
    setBusy(true)
    try {
      const r = await fetch("/api/admin/vocabulary/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languageId: iLang, level: iLevel, rows: preview }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || "Import xatosi")
      setMsg(`${d.count} ta so'z import qilindi${d.skipped ? `, ${d.skipped} ta o'tkazib yuborildi` : ""}`)
      setCsv("")
      if (fileRef.current) fileRef.current.value = ""
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Import xatosi")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {err && <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{err}</div>}
      {msg && <div className="rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-600">{msg}</div>}

      <section className="card">
        <h2 className="font-semibold text-fg">Bitta so'z qo'shish</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-6">
          <select className={inputCls} value={nLang} onChange={(e) => setNLang(e.target.value)}>
            <option value="">Til</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <select className={inputCls} value={nLevel} onChange={(e) => setNLevel(e.target.value)}>
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
          <input className={inputCls} placeholder="So'z" value={nWord} onChange={(e) => setNWord(e.target.value)} />
          <input className={inputCls} placeholder="Tarjima" value={nTr} onChange={(e) => setNTr(e.target.value)} />
          <input className={inputCls} placeholder="Misol (ixtiyoriy)" value={nEx} onChange={(e) => setNEx(e.target.value)} />
          <input className={inputCls} placeholder="Mavzu (ixtiyoriy)" value={nTopic} onChange={(e) => setNTopic(e.target.value)} />
        </div>
        <button className="btn btn-primary mt-3" disabled={busy} onClick={addOne}>
          So'z qo'shish
        </button>
      </section>

      <section className="card">
        <h2 className="font-semibold text-fg">CSV / Excel ommaviy import</h2>
        <p className="mt-1 text-xs text-muted">
          Har bir qatorda: <code className="text-fg">so'z, tarjima, misol, mavzu</code> (vergul yoki Excel’dan tab bilan). Misol va mavzu ixtiyoriy.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <select className={inputCls} value={iLang} onChange={(e) => setILang(e.target.value)}>
            <option value="">Til tanlang</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <select className={inputCls} value={iLevel} onChange={(e) => setILevel(e.target.value)}>
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,.tsv"
            className="text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand/10 file:px-3 file:py-2 file:text-brand"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
        </div>
        <textarea
          className={`${inputCls} mt-3 font-mono`}
          rows={6}
          placeholder="Haus, uy, Das Haus ist gross, Turar joy&#10;Auto, mashina&#10;Wasser, suv"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        <div className="mt-3 flex items-center gap-3">
          <button className="btn btn-primary" disabled={busy} onClick={runImport}>
            Import qilish
          </button>
          <span className="text-sm text-muted">Tayyor: {preview.length} ta yaroqli qator</span>
        </div>
      </section>

      <section className="space-y-3">
        <div className="card flex flex-wrap items-end gap-3">
          <div className="min-w-[150px] flex-1">
            <label className="mb-1 block text-xs text-muted">Til</label>
            <select className={inputCls} value={fLang} onChange={(e) => setFLang(e.target.value)}>
              <option value="">Barchasi</option>
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
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
          <div className="min-w-[150px] flex-1">
            <label className="mb-1 block text-xs text-muted">Qidirish</label>
            <input className={inputCls} placeholder="so'z..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <div className="card overflow-x-auto p-0">
          <div className="flex items-center justify-between px-4 py-2 text-xs text-muted">
            <span>Jami: {total}</span>
            {total > items.length && <span>{items.length} ta ko'rsatilmoqda</span>}
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-y border-line text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">So'z</th>
                <th className="px-4 py-2 font-medium">Tarjima</th>
                <th className="px-4 py-2 font-medium">Daraja</th>
                <th className="px-4 py-2 font-medium">Mavzu</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    Yuklanmoqda...
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((v) => (
                  <tr key={v.id} className="border-b border-line/60">
                    <td className="px-4 py-2 font-medium text-fg">{v.word}</td>
                    <td className="px-4 py-2 text-muted">{v.translation}</td>
                    <td className="px-4 py-2">
                      <span className="badge badge-beta">{v.level}</span>
                    </td>
                    <td className="px-4 py-2 text-muted">{v.topic || "—"}</td>
                    <td className="px-4 py-2 text-right">
                      <button className="text-xs text-muted transition hover:text-red-500" onClick={() => del(v.id)}>
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    So'z topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
