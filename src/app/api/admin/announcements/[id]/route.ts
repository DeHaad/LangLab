import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}
  for (const k of ["title", "body", "active"]) {
    if (b[k] !== undefined) data[k] = b[k]
  }
  const announcement = await prisma.announcement.update({ where: { id: params.id }, data })
  return NextResponse.json({ announcement })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { res } = await requireAdmin()
  if (res) return res
  await prisma.announcement.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
