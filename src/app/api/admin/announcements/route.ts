import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

export async function GET() {
  const { res } = await requireAdmin()
  if (res) return res
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ announcements })
}

export async function POST(req: NextRequest) {
  const { res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const { title, body, active } = b || {}
  if (!title || !body) return NextResponse.json({ error: "title va body majburiy" }, { status: 400 })
  const announcement = await prisma.announcement.create({
    data: { title, body, active: active ?? true },
  })
  return NextResponse.json({ announcement })
}
