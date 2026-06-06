"use client"
import { useCallback, useEffect, useState } from "react"

const inputCls =
  "w-full rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-fg outline-none transition focus:border-brand"

type Ann = { id: string; title: string; body: string; active: boolean; createdAt: string }

export default function AnnouncementManager() {
  const [items, setItems] = useState<Ann[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setErr("")
    try {
      const r = await fetch("/api/admin/announcements")
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Xatolik")
      setItems(d.announcements || [])
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = async () => {
    setErr("")
    if (!title || !body) {
      setErr("Sarlavha va matn majburiy")
      return
    }
    setBusy(true)
    try {
      const r = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || "Xatolik")
      setTitle("")
      setBody("")
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik")
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (a: Ann) => {
    await fetch(`/api/admin/announcements/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !a.active }),
    })
    load()
  }

  const del = async (id: string) => {
    if (!confirm("E'lon o'chirilsinmi?")) return
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div className="mt-6 space-y-6">
      {err && <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{err}</div>}

      <section className="card">
        <h2 className="font-semibold text-fg">Yangi e'lon</h2>
        <div className="mt-3 space-y-2">
          <input className={inputCls} placeholder="Sarlavha" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={inputCls} rows={3} placeholder="Matn" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <button className="btn btn-primary mt-3" disabled={busy} onClick={create}>
          E'lon qo'shish
        </button>
      </section>

      <section className="space-y-3">
        {loading && <div className="card text-center text-muted">Yuklanmoqda...</div>}
        {!loading &&
          items.map((a) => (
            <div key={a.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-fg">{a.title}</span>
                    <span className={`badge ${a.active ? "badge-live" : "badge-soon"}`}>
                      {a.active ? "faol" : "nofaol"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{a.body}</p>
                  <p className="mt-1 text-xs text-muted">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button className="btn btn-outline text-xs" onClick={() => toggle(a)}>
                    {a.active ? "Nofaol qilish" : "Faollashtirish"}
                  </button>
                  <button className="text-xs text-muted transition hover:text-red-500" onClick={() => del(a.id)}>
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        {!loading && items.length === 0 && (
          <div className="card text-center text-muted">Hozircha e'lon yo'q</div>
        )}
      </section>
    </div>
  )
}
