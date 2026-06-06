"use client"
import { useEffect, useState } from "react"
import AppShell from "@/components/AppShell"
import { useLang } from "@/lib/LangContext"

type Leader = { id: string; name: string | null; xp: number; streak: number }

export default function LeaderboardPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}

function Content() {
  const { t } = useLang()
  const [rows, setRows] = useState<Leader[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setRows(d.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">🏆 {t("nav.rating")}</h1>
        <p className="text-muted">XP bo'yicha umumiy reyting.</p>
      </div>

      {loading && <div className="card text-center text-muted">Yuklanmoqda...</div>}

      {!loading && rows.length === 0 && (
        <div className="card mx-auto max-w-md space-y-3 text-center">
          <div className="text-5xl">🏆</div>
          <h2 className="text-lg font-bold text-fg">Reyting hali bo'sh</h2>
          <p className="text-muted">Foydalanuvchilar test ishlab XP to'plagach, reyting shu yerda paydo bo'ladi.</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Ism</th>
                <th className="px-4 py-3 text-right">🔥</th>
                <th className="px-4 py-3 text-right">XP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={p.id} className="border-t border-line text-muted">
                  <td className="px-4 py-3">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                  <td className="px-4 py-3 text-fg">{p.name || "Anonim"}</td>
                  <td className="px-4 py-3 text-right">{p.streak}</td>
                  <td className="px-4 py-3 text-right font-semibold text-fg">{p.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
