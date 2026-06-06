"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LangProvider, useLang, localeNames, type Locale } from "@/lib/LangContext"
import { ThemeProvider, useTheme, type ThemeMode } from "@/lib/ThemeContext"
import Icon from "@/components/Icon"

const NAV = [
  { href: "/dashboard", icon: "home", key: "nav.dashboard" },
  { href: "/tests", icon: "clipboard", key: "nav.tests" },
  { href: "/error-log", icon: "refresh", key: "nav.errorlog" },
  { href: "/vocabulary", icon: "book", key: "nav.vocab" },
  { href: "/grammar", icon: "languages", key: "nav.grammar", soon: true },
  { href: "/ai-chat", icon: "sparkles", key: "nav.aichat", soon: true },
  { href: "/leaderboard", icon: "trophy", key: "nav.rating" },
  { href: "/pricing", icon: "gem", key: "nav.pricing" },
  { href: "/settings", icon: "settings", key: "nav.settings" },
]

function ThemeSwitcher() {
  const { mode, setMode } = useTheme()
  const opts: { id: ThemeMode; icon: string; title: string }[] = [
    { id: "light", icon: "☀️", title: "Light" },
    { id: "dark", icon: "🌙", title: "Dark" },
    { id: "system", icon: "🖥️", title: "System" },
  ]
  return (
    <div className="seg" role="group" aria-label="Theme">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          title={o.title}
          onClick={() => setMode(o.id)}
          className={`seg-btn ${mode === o.id ? "seg-btn-active" : ""}`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  )
}

function TopNav() {
  const pathname = usePathname()
  const { t } = useLang()
  return (
    <nav className="flex items-center gap-1 px-1 sm:justify-center" aria-label="Asosiy menyu">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            title={t(item.key)}
            aria-label={t(item.key)}
            className={`nav-icon ${active ? "nav-icon-active" : ""}`}
          >
            <Icon name={item.icon} size={20} />
            {item.soon && <span className="nav-dot" />}
          </Link>
        )
      })}
    </nav>
  )
}

function Topbar() {
  const { locale, setLocale, t } = useLang()
  const router = useRouter()
  const logout = async () => {
    try {
      localStorage.removeItem("ll_auth")
    } catch {}
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {}
    router.push("/login")
  }
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
        <Link href="/dashboard" className="order-1 flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand2 text-sm font-bold text-white">LL</span>
          <span className="hidden font-bold text-fg sm:inline">LangLab</span>
        </Link>
        <div className="order-3 w-full overflow-x-auto sm:order-2 sm:w-auto sm:flex-1">
          <TopNav />
        </div>
        <div className="order-2 ml-auto flex shrink-0 items-center gap-2 sm:order-3 sm:ml-0">
          <ThemeSwitcher />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded-lg border border-line bg-surface px-2 py-1 text-sm text-fg"
            aria-label={t("settings.uiLang")}
          >
            {(Object.keys(localeNames) as Locale[]).map((l) => (
              <option key={l} value={l}>{localeNames[l]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={logout}
            title="Chiqish"
            aria-label="Chiqish"
            className="nav-icon"
          >
            <Icon name="log-out" size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LangProvider>
        <div className="app-bg min-h-screen">
          <Topbar />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      </LangProvider>
    </ThemeProvider>
  )
}
