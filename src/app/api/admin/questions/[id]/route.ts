import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}
  for (const k of ["skill", "level", "prompt", "passage", "audioUrl", "options", "correctAnswer", "rubric", "points"]) {
    if (b[k] !== undefined) data[k] = b[k]
  }
  if (data.points !== undefined) data.points = Number(data.points) || 1
  const question = await prisma.question.update({ where: { id: params.id }, data })
  return NextResponse.json({ question })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { res } = await requireAdmin()
  if (res) return res
  try {
    await prisma.question.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "O'chirib bo'lmadi (bog'liq javoblar bor)" }, { status: 400 })
  }
}
