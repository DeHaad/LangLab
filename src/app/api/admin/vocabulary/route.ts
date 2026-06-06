import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

// Lug'at ro'yxati (filtr: languageId, level, q)
export async function GET(req: NextRequest) {
  const { res } = await requireAdmin()
  if (res) return res
  const sp = req.nextUrl.searchParams
  const where: Record<string, unknown> = {}
  const languageId = sp.get("languageId")
  const level = sp.get("level")
  const q = sp.get("q")
  if (languageId) where.languageId = languageId
  if (level) where.level = level
  if (q) where.word = { contains: q, mode: "insensitive" }
  const [items, total] = await Promise.all([
    prisma.vocabulary.findMany({
      where,
      include: { language: { select: { name: true } } },
      orderBy: { word: "asc" },
      take: 300,
    }),
    prisma.vocabulary.count({ where }),
  ])
  return NextResponse.json({ items, total })
}

// Bitta so'z qo'shish
export async function POST(req: NextRequest) {
  const { res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const { languageId, level, word, translation, example, topic } = b || {}
  if (!languageId || !level || !word || !translation)
    return NextResponse.json({ error: "languageId, level, word, translation majburiy" }, { status: 400 })
  const item = await prisma.vocabulary.create({
    data: { languageId, level, word, translation, example: example || null, topic: topic || null },
  })
  return NextResponse.json({ item })
}
