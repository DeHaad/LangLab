import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/auth"
import { evaluateWriting } from "@/lib/ai"
import { incrMonthlyCounter } from "@/lib/redis"

const FREE_LIMIT = Number(process.env.FREE_AI_EVALS_PER_MONTH || 3)

// Writing / Speaking javobini AI bilan baholash (freemium limit bilan)
export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "avtorizatsiya kerak" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "foydalanuvchi topilmadi" }, { status: 404 })

  // Freemium limit tekshiruvi (Redis bo'lsa Redis, aks holda DB orqali)
  if (user.plan === "free") {
    let used = await incrMonthlyCounter(userId)
    if (used === null) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      used = (await prisma.aiEvaluation.count({ where: { userId, createdAt: { gte: monthStart } } })) + 1
    }
    if (used > FREE_LIMIT) {
      return NextResponse.json({ error: "limit", message: `Oyiga ${FREE_LIMIT} ta bepul AI baho tugadi. Premium oling.` }, { status: 402 })
    }
  }

  const { attemptId, questionId, response } = await req.json()
  const question = await prisma.question.findUnique({ where: { id: questionId } })
  const attempt = await prisma.attempt.findFirst({ where: { id: attemptId, userId } })
  if (!question || !attempt) return NextResponse.json({ error: "ma'lumot topilmadi" }, { status: 404 })

  const result = await evaluateWriting({
    skill: question.skill,
    level: question.level,
    prompt: question.prompt,
    rubric: question.rubric,
    response,
    uiLocale: user.uiLocale,
  })

  const evaluation = await prisma.aiEvaluation.upsert({
    where: { attemptId },
    update: { score: result.score, maxScore: result.maxScore, feedback: result.feedback, corrections: result.corrections, model: process.env.OPENAI_MODEL || "gpt-4o-mini" },
    create: {
      userId, attemptId, skill: question.skill,
      score: result.score, maxScore: result.maxScore,
      feedback: result.feedback, corrections: result.corrections,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    },
  })

  await prisma.attempt.update({ where: { id: attemptId }, data: { status: "evaluated", score: result.score, maxScore: result.maxScore } })
  return NextResponse.json({ evaluation })
}
