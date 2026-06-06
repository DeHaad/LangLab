"use client"
import Link from "next/link"
import { useLang } from "@/lib/LangContext"

type Feature = { icon: string; label: string }

export default function ComingSoon({
  icon,
  title,
  subtitle,
  features,
}: {
  icon: string
  title: string
  subtitle: string
  features?: Feature[]
}) {
  const { t } = useLang()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">{icon} {title}</h1>
        <p className="text-muted">{subtitle}</p>
      </div>
      <div className="card card-glow flex flex-col items-center py-14 text-center">
        <div className="text-5xl">🚧</div>
        <span className="badge badge-soon mt-4">{t("common.comingSoon")}</span>
        <p className="mt-3 max-w-sm text-muted">{t("soon.body")}</p>
        <Link href="/dashboard" className="btn btn-outline mt-6">← {t("nav.dashboard")}</Link>
      </div>
      {features && features.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Tez orada keladi</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.label} className="card flex items-center gap-3">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-sm text-fg">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
