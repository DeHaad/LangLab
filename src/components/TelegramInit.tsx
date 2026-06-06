"use client"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

type TgWebApp = {
  initData?: string
  ready?: () => void
  expand?: () => void
}

// Telegram Mini App ichida ochilganda avtomatik kirish (initData -> sessiya cookie)
export default function TelegramInit() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp
    if (!tg) return
    try {
      tg.ready?.()
      tg.expand?.()
    } catch {
      // ignore
    }
    const initData = tg.initData || ""
    if (!initData) return
    fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        if (pathname === "/" || pathname === "/login") router.replace("/dashboard")
        else router.refresh()
      })
      .catch(() => {})
  }, [pathname, router])

  return null
}
