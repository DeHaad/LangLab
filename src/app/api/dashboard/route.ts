import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/auth"

export const dynamic = "force-dynamic"

const SKILLS: [string, string][] = [
  ["reading", "O'qish"],
  ["listening", "Tinglash"],
  ["writing", "Yozish"],
  ["speaking", "Gapirish"],
]

const DAYS = 30

export async function GET(_req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "avtorizatsiya kerak" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { learningLang: true },
  })
  if (!user) return NextResponse.json({ error: "foydalanuvchi topilmadi" }, { status: 404 })

  const [answers, evals, errors, attempts] = await Promise.all([
    prisma.answer.findMany({
      where: { attempt: { userId } },
      select: { points: true, question: { select: { skill: true, points: true } } },
    }),
    prisma.aiEvaluation.findMany({
      where: { userId },
      select: { skill: true, score: true, maxScore: true },
    }),
    prisma.errorLog.findMany({
      where: { userId },
      select: { createdAt: true, status: true, nextReviewAt: true },
    }),
    prisma.attempt.findMany({
      where: { userId, status: { in: ["submitted", "evaluated"] } },
      select: {
        score: true,
        maxScore: true,
        test: {
          select: {
            certificate: {
              select: { name: true, level: true, language: { select: { name: true, flag: true } } },
            },
          },
        },
      },
    }),
  ])

  // --- Skill bo'yicha aniqlik ---
  const acc: Record<string, { got: number; max: number }> = {}
  for (const [k] of SKILLS) acc[k] = { got: 0, max: 0 }
  for (const a of answers) {
    const sk = a.question?.skill
    if (!sk || !acc[sk]) continue
    acc[sk].got += a.points ?? 0
    acc[sk].max += a.question?.points ?? 0
  }
  for (const e of evals) {
    if (!acc[e.skill]) continue
    acc[e.skill].got += e.score
    acc[e.skill].max += e.maxScore
  }
  const skills = SKILLS.map(([key, label]) => {
    const a = acc[key]
    const ratio = a.max > 0 ? a.got / a.max : 0
    return {
      skill: key,
      label,
      accuracy: Math.round(ratio * 100),
      band: Number((ratio * 9).toFixed(1)),
      hasData: a.max > 0,
    }
  })

  // --- Kurslar (sertifikat bo'yicha urinishlar) ---
  const courseMap = new Map<string, { name: string; flag: string; level: string; got: number; max: number }>()
  for (const at of attempts) {
    const c = at.test?.certificate
    if (!c) continue
    const cur = courseMap.get(c.name) || { name: c.name, flag: c.language?.flag || "\ud83d\udcd8", level: c.level, got: 0, max: 0 }
    cur.got += at.score ?? 0
    cur.max += at.maxScore ?? 0
    courseMap.set(c.name, cur)
  }
  const courses = Array.from(courseMap.values()).map((c) => ({
    name: c.name,
    flag: c.flag,
    level: c.level,
    progress: c.max > 0 ? Math.round((c.got / c.max) * 100) : 0,
  }))

  // --- Issiqlik xaritasi (oxirgi 30 kun, xatolar soni) ---
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const heatmap = new Array(DAYS).fill(0)
  for (const er of errors) {
    const d = new Date(er.createdAt)
    d.setHours(0, 0, 0, 0)
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
    if (diff >= 0 && diff < DAYS) heatmap[DAYS - 1 - diff] += 1
  }

  // --- Takrorlash ---
  const now = new Date()
  const dueToday = errors.filter((e) => e.status === "active" && (!e.nextReviewAt || new Date(e.nextReviewAt) <= now)).length
  const mastered = errors.filter((e) => e.status === "mastered").length

  // --- Imtihongacha kunlar ---
  const examInDays = user.examDate
    ? Math.max(0, Math.ceil((new Date(user.examDate).getTime() - Date.now()) / 86400000))
    : null

  // --- Yutuqlar ---
  const badges = [
    { icon: "\ud83d\udd25", label: "5 kun streak", earned: user.streak >= 5 },
    { icon: "\ud83c\udfaf", label: "Birinchi test", earned: attempts.length >= 1 },
    { icon: "\u2b50", label: "100 XP", earned: user.xp >= 100 },
    { icon: "\ud83c\udf93", label: "5 o'zlashtirildi", earned: mastered >= 5 },
    { icon: "\ud83d\udc51", label: "Premium", earned: user.plan === "premium" },
  ]

  return NextResponse.json({
    user: {
      name: user.name || "Talaba",
      plan: user.plan,
      targetLevel: user.targetLevel,
      learningLang: user.learningLang ? { name: user.learningLang.name, flag: user.learningLang.flag } : null,
      examInDays,
      streak: user.streak,
      xp: user.xp,
    },
    skills,
    courses,
    heatmap,
    review: { dueToday, mastered, total: errors.length },
    badges,
    totalAttempts: attempts.length,
  })
}
