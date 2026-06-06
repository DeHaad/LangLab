"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import { useLang } from "@/lib/LangContext"

type Test = { id: string; title: string; skill: string; durationMin: number; questionCount: number }
type Cert = {
  id: string
  code: string
  name: string
  level: string
  language: { code: string; name: string; flag: string | null }
  tests: Test[]
}

const SKILL_ICON: Record<string, string> = {
  reading: "\uD83D\uDCD6",
  listening: "\uD83C\uDFA7",
  writing: "\u270D\uFE0F",
  speaking: "\uD83D\uDDE3\uFE0F",
}

export default function TestsPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}

function Content() {
  const { t } = useLang()
  const [certs, setCerts] = useState<Cert[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((d) => setCerts(d.certificates || []))
      .catch(() => setErr("Ma'lumotlarni yuklab bo'lmadi"))
      .finally(() => setLoading(false))
  }, [])

  const totalTests = certs.reduce((s, c) => s + c.tests.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">📝 {t("nav.tests")}</h1>
        <p className="text-muted">Sertifikat bo'limlari bo'yicha mock testlar.</p>
      </div>

      {loading && <div className="card text-center text-muted">Yuklanmoqda...</div>}
      {err && <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</div>}

      {!loading && !err && totalTests === 0 && (
        <div className="card mx-auto max-w-md space-y-3 text-center">
          <div className="text-5xl">📋</div>
          <h2 className="text-lg font-bold text-fg">Testlar hali qo'shilmagan</h2>
          <p className="text-muted">Admin panel orqali sertifikat va testlar qo'shilgach, ular shu yerda paydo bo'ladi.</p>
        </div>
      )}

      {!loading &&
        certs
          .filter((c) => c.tests.length > 0)
          .map((c) => (
            <section key={c.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{c.language.flag || "\uD83C\uDF10"}</span>
                <h2 className="font-semibold text-fg">
                  {c.name} <span className="text-muted">· {c.level}</span>
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {c.tests.map((s) => {
                  const ready = s.questionCount > 0
                  return (
                    <div key={s.id} className="card flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-3xl">{SKILL_ICON[s.skill] || "\uD83D\uDCDD"}</div>
                        <span className={`badge ${ready ? "badge-live" : "badge-soon"}`}>
                          {ready ? "● live" : t("common.comingSoon")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-fg">{s.title}</p>
                        <p className="text-sm text-muted">
                          {s.durationMin} {t("common.minutes")} · {s.questionCount} {t("common.questions")}
                        </p>
                      </div>
                      {ready ? (
                        <Link href={`/tests/${s.id}`} className="btn btn-primary">
                          {t("common.start")}
                        </Link>
                      ) : (
                        <button disabled className="btn btn-outline cursor-not-allowed opacity-50">
                          {t("common.comingSoon")}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
    </div>
  )
}
