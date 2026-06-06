import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin"

// Admin himoyasi: admin bo'lmasa 401 javob qaytaradi.
// Foydalanish: const { admin, res } = await requireAdmin(); if (res) return res
export async function requireAdmin() {
  const admin = await getAdminUser()
  if (!admin) {
    return { admin: null, res: NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 }) }
  }
  return { admin, res: null as NextResponse | null }
}
