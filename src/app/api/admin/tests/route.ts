import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

// Yangi test (savollar to'plami)
export async function POST(req: NextRequest) {
  const { res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const { certificateId, skill, title, durationMin } = b || {}
  if (!certificateId || !skill || !title)
    return NextResponse.json({ error: "certificateId, skill, title majburiy" }, { status: 400 })
  const test = await prisma.test.create({
    data: { certificateId, skill, title, durationMin: Number(durationMin) || 30 },
  })
  return NextResponse.json({ test })
}
