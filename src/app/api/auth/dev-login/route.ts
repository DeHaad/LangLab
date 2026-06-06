import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSession, setSessionCookie } from "@/lib/auth"
import { adminTelegramIds } from "@/lib/admin"

// FAQAT development uchun: Telegram'siz admin sifatida kirish (lokal sinov uchun)
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "faqat development" }, { status: 403 })
  }
  const adminId = adminTelegramIds()[0] || "5693952593"
  const user = await prisma.user.upsert({
    where: { telegramId: adminId },
    update: { role: "admin" },
    create: { telegramId: adminId, name: "Dev Admin", role: "admin" },
  })
  const jwt = await createSession(user.id)
  await setSessionCookie(jwt)
  return NextResponse.json({ ok: true })
}
