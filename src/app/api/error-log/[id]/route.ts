import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/auth"

export const dynamic = "force-dynamic"

// Spaced repetition oraliqlari: 1 soat -> 1 kun -> 3 kun -> 1 hafta -> 1 oy
const STEPS_MS = [
  60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
]

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "avtorizatsiya kerak" }, { status: 401 })
  const log = await prisma.errorLog.findFirst({ where: { id: params.id, userId } })
  if (!log) return NextResponse.json({ error: "topilmadi" }, { status: 404 })
  const { understood } = await req.json().catch(() => ({}))
  const now = new Date()
  let data: Record<string, unknown>
  if (understood) {
    const rep = log.repetition + 1
    if (rep >= STEPS_MS.length) {
      data = { repetition: rep, status: "mastered", nextReviewAt: null, reviewedAt: now }
    } else {
      data = { repetition: rep, status: "active", nextReviewAt: new Date(now.getTime() + STEPS_MS[rep]), reviewedAt: now }
    }
  } else {
    data = { repetition: 0, status: "active", nextReviewAt: new Date(now.getTime() + STEPS_MS[0]), reviewedAt: now }
  }
  const updated = await prisma.errorLog.update({ where: { id: log.id }, data })
  return NextResponse.json({ errorLog: updated })
}
