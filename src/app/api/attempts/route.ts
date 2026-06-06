import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/auth"

// Test boshlash: yangi urinish yaratadi
export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "avtorizatsiya kerak" }, { status: 401 })

  const { testId } = await req.json()
  const test = await prisma.test.findUnique({ where: { id: testId } })
  if (!test) return NextResponse.json({ error: "test topilmadi" }, { status: 404 })

  const attempt = await prisma.attempt.create({
    data: { userId, testId, status: "in_progress" },
  })
  return NextResponse.json({ attempt })
}

// Reading/Listening javoblarini avtomatik tekshirish va yakunlash
export async function PATCH(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "avtorizatsiya kerak" }, { status: 401 })

  const { attemptId, answers } = await req.json() as {
    attemptId: string
    answers: { questionId: string; response: unknown }[]
  }

  const attempt = await prisma.attempt.findFirst({ where: { id: attemptId, userId } })
  if (!attempt) return NextResponse.json({ error: "urinish topilmadi" }, { status: 404 })

  let score = 0
  let maxScore = 0
  for (const a of answers) {
    const q = await prisma.question.findUnique({ where: { id: a.questionId } })
    if (!q) continue
    maxScore += q.points
    const isCorrect = JSON.stringify(q.correctAnswer) === JSON.stringify(a.response)
    const points = isCorrect ? q.points : 0
    score += points
    await prisma.answer.create({
      data: { attemptId, questionId: q.id, response: a.response as object, isCorrect, points },
    })
    // Xato bo'lsa — error_log ga yozish (qayta mashq uchun)
    if (!isCorrect) {
      const dueAt = new Date(Date.now() + 60 * 60 * 1000)
      await prisma.errorLog.upsert({
        where: { userId_questionId: { userId, questionId: q.id } },
        update: {
          response: a.response as object,
          status: "active",
          repetition: 0,
          nextReviewAt: dueAt,
          reviewedAt: null,
        },
        create: {
          userId,
          questionId: q.id,
          response: a.response as object,
          nextReviewAt: dueAt,
        },
      })
    }
  }

  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: { status: "submitted", score, maxScore, submittedAt: new Date() },
  })
  return NextResponse.json({ attempt: updated })
}
