import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}
  for (const k of ["code", "name", "level", "isActive"]) {
    if (b[k] !== undefined) data[k] = b[k]
  }
  const certificate = await prisma.certificate.update({ where: { id: params.id }, data })
  return NextResponse.json({ certificate })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { res } = await requireAdmin()
  if (res) return res
  const qCount = await prisma.question.count({ where: { certificateId: params.id } })
  if (qCount > 0)
    return NextResponse.json({ error: `Avval ${qCount} ta savolni o'chiring` }, { status: 400 })
  try {
    await prisma.certificate.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "O'chirib bo'lmadi (bog'liq testlar bor)" }, { status: 400 })
  }
}
