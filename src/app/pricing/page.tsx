"use client"
import AppShell from "@/components/AppShell"
import { useLang } from "@/lib/LangContext"

export default function PricingPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}

function Content() {
  const { locale, t } = useLang()
  const free: Record<string, string[]> = {
    uz: ["Reading mock testlar", "Cheklangan lug'at", "Oyiga 3 ta AI Writing baho", "Reyting"],
    ru: ["Пробные тесты Reading", "Ограниченный словарь", "3 AI-оценки Writing в месяц", "Рейтинг"],
    en: ["Reading mock tests", "Limited vocabulary", "3 AI Writing evals / month", "Leaderboard"],
  }
  const premium: Record<string, string[]> = {
    uz: ["Barcha mock testlar", "Cheksiz AI Writing baho", "Cheksiz lug'at + grammatika", "Shaxsiy o'quv reja", "🔜 AI ovozli tutor (Faza 2)", "🔜 Speaking AI baho (Faza 2)"],
    ru: ["Все пробные тесты", "Безлимит AI-оценок Writing", "Безлимит словарь + грамматика", "Личный план обучения", "🔜 AI голосовой тьютор (Фаза 2)", "🔜 AI-оценка Speaking (Фаза 2)"],
    en: ["All mock tests", "Unlimited AI Writing evals", "Unlimited vocab + grammar", "Personal study plan", "🔜 AI voice tutor (Phase 2)", "🔜 Speaking AI eval (Phase 2)"],
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">{t("nav.pricing")}</h1>
        <p className="text-muted">{t("pricing.subtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card flex flex-col">
          <h3 className="text-lg font-bold text-fg">{t("common.free")}</h3>
          <p className="mt-1 text-3xl font-bold text-fg">0 so'm</p>
          <ul className="mt-4 space-y-2 text-sm text-fg">
            {(free[locale] || free.uz).map((f) => (
              <li key={f} className="flex gap-2"><span className="text-emerald-500">✓</span> {f}</li>
            ))}
          </ul>
          <button className="btn btn-outline mt-6 w-full">{t("common.start")}</button>
        </div>
        <div className="card card-glow relative flex flex-col border-brand ring-1 ring-brand">
          <span className="badge badge-live absolute right-4 top-4">★ Premium</span>
          <h3 className="text-lg font-bold gradient-text">{t("common.premium")}</h3>
          <p className="mt-1 text-3xl font-bold text-fg">29 000 <span className="text-base font-normal text-muted">so'm / {t("pricing.month")}</span></p>
          <ul className="mt-4 space-y-2 text-sm text-fg">
            {(premium[locale] || premium.uz).map((f) => (
              <li key={f} className="flex gap-2"><span className="text-emerald-500">✓</span> {f}</li>
            ))}
          </ul>
          <button className="btn btn-primary mt-6 w-full">{t("common.premium")}</button>
        </div>
      </div>
    </div>
  )
}
