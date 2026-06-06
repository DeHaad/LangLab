import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

const ROLES = ["user", "admin"]
const PLANS = ["free", "premium"]

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { admin, res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}
  if (b.role !== undefined) {
    if (!ROLES.includes(b.role)) return NextResponse.json({ error: "Noto'g'ri rol" }, { status: 400 })
    data.role = b.role
  }
  if (b.plan !== undefined) {
    if (!PLANS.includes(b.plan)) return NextResponse.json({ error: "Noto'g'ri reja" }, { status: 400 })
    data.plan = b.plan
  }
  // O'zining admin rolini tortib olishdan himoya
  if (admin && admin.id === params.id && data.role === "user")
    return NextResponse.json({ error: "O'zingizdan admin huquqini olib bo'lmaydi" }, { status: 400 })
  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "O'zgartirish uchun maydon yo'q" }, { status: 400 })
  const user = await prisma.user.update({ where: { id: params.id }, data })
  return NextResponse.json({ user: { id: user.id, role: user.role, plan: user.plan } })
}
