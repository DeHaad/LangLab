"use client"
import { useState } from "react"

type U = {
  id: string
  name: string | null
  telegramId: string | null
  email: string | null
  plan: string
  role: string
  xp: number
  createdAt: string
}

const selCls =
  "rounded-lg border border-line bg-surface2 px-2 py-1 text-xs text-fg outline-none transition focus:border-brand"

export default function UsersTable({ initial }: { initial: U[] }) {
  const [users, setUsers] = useState<U[]>(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState("")
  const [q, setQ] = useState("")

  const patch = async (id: string, body: Partial<U>) => {
    setBusy(id)
    setErr("")
    const prev = users
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...body } : u)))
    try {
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || "Xatolik")
    } catch (e) {
      setUsers(prev)
      setErr(e instanceof Error ? e.message : "Xatolik")
    } finally {
      setBusy(null)
    }
  }

  const shown = q
    ? users.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q.toLowerCase()) ||
          (u.telegramId || "").includes(q) ||
          (u.email || "").toLowerCase().includes(q.toLowerCase()),
      )
    : users

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">Jami (oxirgi 200): {users.length}</p>
        <input
          className="w-full max-w-xs rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-fg outline-none focus:border-brand"
          placeholder="Ism / Telegram / email bo'yicha qidirish"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {err && <div className="mt-3 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">{err}</div>}
      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Ism</th>
              <th className="px-4 py-3 font-medium">Telegram ID</th>
              <th className="px-4 py-3 font-medium">Reja</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">XP</th>
              <th className="px-4 py-3 font-medium">Sana</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id} className={`border-b border-line/60 ${busy === u.id ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 text-fg">{u.name || "—"}</td>
                <td className="px-4 py-3 text-muted">{u.telegramId || "—"}</td>
                <td className="px-4 py-3">
                  <select className={selCls} value={u.plan} disabled={busy === u.id} onChange={(e) => patch(u.id, { plan: e.target.value })}>
                    <option value="free">free</option>
                    <option value="premium">premium</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select className={selCls} value={u.role} disabled={busy === u.id} onChange={(e) => patch(u.id, { role: e.target.value })}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-fg">{u.xp}</td>
                <td className="px-4 py-3 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Foydalanuvchi topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
