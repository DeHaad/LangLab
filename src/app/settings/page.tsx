"use client"
import { useState } from "react"
import AppShell from "@/components/AppShell"
import { useLang, localeNames, type Locale } from "@/lib/LangContext"
import { useTheme, type ThemeMode } from "@/lib/ThemeContext"

export default function SettingsPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}

const SELECT = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-fg"

function Content() {
  const { locale, setLocale, t } = useLang()
  const { mode, setMode } = useTheme()
  const [saved, setSaved] = useState(false)
  const themes: { id: ThemeMode; icon: string; label: string }[] = [
    { id: "light", icon: "☀️", label: "Light" },
    { id: "dark", icon: "🌙", label: "Dark" },
    { id: "system", icon: "🖥️", label: "System" },
  ]
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">{t("nav.settings")}</h1>
        <p className="text-muted">{t("settings.subtitle")}</p>
      </div>

      <div className="card space-y-2">
        <label className="font-medium text-fg">{t("settings.uiLang")}</label>
        <p className="text-xs text-muted">{t("settings.uiLangHint")}</p>
        <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} className={SELECT}>
          {(Object.keys(localeNames) as Locale[]).map((l) => (
            <option key={l} value={l}>{localeNames[l]}</option>
          ))}
        </select>
      </div>

      <div className="card space-y-3">
        <label className="font-medium text-fg">Ko'rinish (mavzu)</label>
        <div className="seg" role="group" aria-label="Theme">
          {themes.map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => setMode(th.id)}
              className={`seg-btn ${mode === th.id ? "seg-btn-active" : ""}`}
            >
              {th.icon} {th.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-2">
        <label className="font-medium text-fg">{t("settings.learnLang")}</label>
        <select className={SELECT}>
          <option>🇩🇪 Deutsch (Telc)</option>
          <option disabled>🇬🇧 English (IELTS) — {t("common.comingSoon")}</option>
          <option disabled>🇫🇷 Français (DELF) — {t("common.comingSoon")}</option>
        </select>
      </div>

      <div className="card space-y-2">
        <label className="font-medium text-fg">{t("settings.targetCert")}</label>
        <select className={SELECT}>
          <option>Telc B1</option>
          <option>Telc B2</option>
        </select>
      </div>

      <div className="card space-y-2">
        <label className="font-medium text-fg">{t("settings.examDate")}</label>
        <input type="date" defaultValue="2026-07-20" className={SELECT} />
      </div>

      <button
        onClick={() => {
          setSaved(true)
          setTimeout(() => setSaved(false), 1500)
        }}
        className="btn btn-primary"
      >
        {saved ? t("settings.saved") : t("settings.save")}
      </button>
    </div>
  )
}
