import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// Ommaviy: lug'at to'plami (filtr: level, lang)
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const level = sp.get("level")
  const lang = sp.get("lang")
  const where: Record<string, unknown> = {}
  if (level) where.level = level
  if (lang) where.language = { code: lang }
  const items = await prisma.vocabulary.findMany({
    where,
    select: { id: true, word: true, translation: true, example: true, topic: true, level: true },
    orderBy: { word: "asc" },
    take: 300,
  })
  return NextResponse.json({ vocabulary: items })
}
