import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { res } = await requireAdmin()
  if (res) return res
  try {
    await prisma.test.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "O'chirib bo'lmadi (bog'liq urinishlar bor)" }, { status: 400 })
  }
}
