import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

// Sertifikatlar ro'yxati (til + savol/test soni bilan)
export async function GET() {
  const { res } = await requireAdmin()
  if (res) return res
  const certificates = await prisma.certificate.findMany({
    include: { language: true, _count: { select: { questions: true, tests: true } } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json({ certificates })
}

// Yangi sertifikat
export async function POST(req: NextRequest) {
  const { res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const { languageId, code, name, level, isActive } = b || {}
  if (!languageId || !code || !name || !level)
    return NextResponse.json({ error: "languageId, code, name, level majburiy" }, { status: 400 })
  try {
    const certificate = await prisma.certificate.create({
      data: { languageId, code, name, level, isActive: isActive ?? true },
    })
    return NextResponse.json({ certificate })
  } catch {
    return NextResponse.json({ error: "Bu til uchun shunday kod bor" }, { status: 400 })
  }
}
