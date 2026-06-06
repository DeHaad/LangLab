import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

// Savollar ro'yxati (filtr: certificateId, skill, level)
export async function GET(req: NextRequest) {
  const { res } = await requireAdmin()
  if (res) return res
  const sp = req.nextUrl.searchParams
  const where: Record<string, unknown> = {}
  const certificateId = sp.get("certificateId")
  const skill = sp.get("skill")
  const level = sp.get("level")
  if (certificateId) where.certificateId = certificateId
  if (skill) where.skill = skill
  if (level) where.level = level
  const questions = await prisma.question.findMany({
    where,
    include: { certificate: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })
  return NextResponse.json({ questions })
}

// Yangi savol
export async function POST(req: NextRequest) {
  const { res } = await requireAdmin()
  if (res) return res
  const b = await req.json().catch(() => ({}))
  const { certificateId, skill, level, prompt, passage, audioUrl, options, correctAnswer, rubric, points } = b || {}
  if (!certificateId || !skill || !level || !prompt)
    return NextResponse.json({ error: "certificateId, skill, level, prompt majburiy" }, { status: 400 })
  const cert = await prisma.certificate.findUnique({ where: { id: certificateId } })
  if (!cert) return NextResponse.json({ error: "Sertifikat topilmadi" }, { status: 400 })
  const question = await prisma.question.create({
    data: {
      languageId: cert.languageId,
      certificateId,
      skill,
      level,
      prompt,
      passage: passage || null,
      audioUrl: audioUrl || null,
      options: options ?? undefined,
      correctAnswer: correctAnswer ?? undefined,
      rubric: rubric || null,
      points: Number(points) || 1,
    },
  })
  return NextResponse.json({ question })
}
