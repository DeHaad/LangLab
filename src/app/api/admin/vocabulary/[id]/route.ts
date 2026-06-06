import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}
  for (const k of ["level", "word", "translation", "example", "topic"]) {
    if (b[k] !== undefined) data[k] = b[k] || null
  }
  if (data.word === null) return NextResponse.json({ error: "word bo'sh bo'lmasin" }, { status: 400 })
  const item = await prisma.vocabulary.update({ where: { id: params.id }, data })
  return NextResponse.json({ item })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { res } = await requireAdmin()
  if (res) return res
  try {
    await prisma.vocabulary.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "O'chirib bo'lmadi (bog'liq progress bor)" }, { status: 400 })
  }
}
