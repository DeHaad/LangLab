import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// Ommaviy: bitta test + uning savollari (to'g'ri javoblarsiz — server tomonida baholanadi)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const test = await prisma.test.findUnique({ where: { id: params.id } })
  if (!test) return NextResponse.json({ error: "test topilmadi" }, { status: 404 })
  const questions = await prisma.question.findMany({
    where: { certificateId: test.certificateId, skill: test.skill },
    select: {
      id: true,
      skill: true,
      level: true,
      prompt: true,
      passage: true,
      audioUrl: true,
      options: true,
      points: true,
    },
    orderBy: { id: "asc" },
  })
  return NextResponse.json({
    test: { id: test.id, title: test.title, skill: test.skill, durationMin: test.durationMin },
    questions,
  })
}
