import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

type Row = { word?: string; translation?: string; example?: string | null; topic?: string | null }

// CSV/Excel'dan ommaviy import: { languageId, level, rows: Row[] }
export async function POST(req: NextRequest) {
  const { res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const { languageId, level, rows } = b || {}
  if (!languageId || !level)
    return NextResponse.json({ error: "languageId va level majburiy" }, { status: 400 })
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: "Import uchun qatorlar yo'q" }, { status: 400 })

  const data = (rows as Row[])
    .map((r) => ({
      languageId,
      level,
      word: (r.word || "").trim(),
      translation: (r.translation || "").trim(),
      example: r.example ? String(r.example).trim() || null : null,
      topic: r.topic ? String(r.topic).trim() || null : null,
    }))
    .filter((r) => r.word && r.translation)

  if (data.length === 0)
    return NextResponse.json({ error: "Yaroqli qator topilmadi (so'z va tarjima kerak)" }, { status: 400 })

  const result = await prisma.vocabulary.createMany({ data })
  return NextResponse.json({ count: result.count, skipped: rows.length - data.length })
}
