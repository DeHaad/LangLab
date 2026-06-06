import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTelegramInitData } from "@/lib/telegram"
import { createSession, setSessionCookie } from "@/lib/auth"
import { isAdminTelegramId } from "@/lib/admin"

// Telegram Mini App orqali kirish/ro'yxatdan o'tish
export async function POST(req: NextRequest) {
  const { initData } = await req.json()
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return NextResponse.json({ error: "bot token yo'q" }, { status: 500 })

  const tgUser = verifyTelegramInitData(initData, token)
  if (!tgUser) return NextResponse.json({ error: "initData yaroqsiz" }, { status: 401 })

  const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || tgUser.username
  const admin = isAdminTelegramId(tgUser.id)
  const user = await prisma.user.upsert({
    where: { telegramId: tgUser.id },
    update: { name, ...(admin ? { role: "admin" } : {}) },
    create: { telegramId: tgUser.id, name, role: admin ? "admin" : "user" },
  })

  const jwt = await createSession(user.id)
  await setSessionCookie(jwt)
  return NextResponse.json({ user: { id: user.id, name: user.name, uiLocale: user.uiLocale, plan: user.plan } })
}
