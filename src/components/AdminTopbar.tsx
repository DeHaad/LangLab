"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Icon from "@/components/Icon"

const NAV = [
  { href: "/admin", icon: "home", label: "Boshqaruv" },
  { href: "/admin/users", icon: "user", label: "Foydalanuvchilar" },
  { href: "/admin/tests", icon: "clipboard", label: "Testlar" },
  { href: "/admin/questions", icon: "sparkles", label: "Savollar" },
  { href: "/admin/vocabulary", icon: "book", label: "Lug'at" },
]

export default function AdminTopbar({ name }: { name?: string | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {}
    router.push("/login")
  }
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand2 text-sm font-bold text-white">LL</span>
          <span className="font-bold text-fg">LangLab <span className="text-muted">Admin</span></span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${active ? "bg-brand/10 text-brand" : "text-muted hover:bg-surface2 hover:text-fg"}`}
              >
                <Icon name={item.icon} size={16} />
                <span className="hidden sm:inline">{item.label}</span>
                {item.soon && <span className="nav-dot" />}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-sm text-muted sm:inline">{name || "Admin"}</span>
          <button type="button" onClick={logout} title="Chiqish" aria-label="Chiqish" className="nav-icon">
            <Icon name="log-out" size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
