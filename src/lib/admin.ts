import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/auth"

// Admin Telegram ID'lar ro'yxati (.env: ADMIN_TELEGRAM_IDS=5693952593,123...)
export function adminTelegramIds(): string[] {
  return (process.env.ADMIN_TELEGRAM_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export function isAdminTelegramId(id?: string | null): boolean {
  if (!id) return false
  return adminTelegramIds().includes(String(id))
}

// Joriy sessiyadagi foydalanuvchi (cookie -> JWT -> DB)
export async function getSessionUser() {
  const userId = await getUserId()
  if (!userId) return null
  return prisma.user.findUnique({ where: { id: userId } })
}

// Admin bo'lsa user qaytaradi, aks holda null
export async function getAdminUser() {
  const user = await getSessionUser()
  if (!user) return null
  if (user.role === "admin" || isAdminTelegramId(user.telegramId)) return user
  return null
}
