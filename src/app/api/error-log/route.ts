import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/auth"

export const dynamic = "force-dynamic"

const SKILL_LABEL: Record<string, string> = {
  reading: "O'qish",
  listening: "Tinglash",
  writing: "Yozish",
  speaking: "Gapirish",
}

function asText(v: unknown): string {
  if (v == null) return "\u2014"
  if (typeof v === "string") return v
  return JSON.stringify(v)
}

function humanize(d: Date | null, now: Date): string {
  if (!d) return "Bugun"
  const diff = d.getTime() - now.getTime()
  if (diff <= 0) return "Bugun"
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000))
  if (days <= 1) return "Ertaga"
  if (days < 7) return `${days} kun`
  if (days < 30) return `${Math.round(days / 7)} hafta`
  return `${Math.round(days / 30)} oy`
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "avtorizatsiya kerak" }, { status: 401 })
  const now = new Date()
  const logs = await prisma.errorLog.findMany({
    where: { userId },
    include: { question: { include: { certificate: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })
  const items = logs.map((l) => {
    const topic = l.question.certificate?.name || SKILL_LABEL[l.question.skill] || l.question.skill
    const due = !l.nextReviewAt || l.nextReviewAt <= now
    return {
      id: l.id,
      status: l.status,
      repetition: l.repetition,
      topic,
      tags: [l.question.level, SKILL_LABEL[l.question.skill] || l.question.skill],
      question: l.question.prompt,
      yourAnswer: asText(l.response),
      correctAnswer: asText(l.question.correctAnswer),
      explanation: l.question.rubric || "Bu savol uchun tushuntirish hali qo'shilmagan.",
      nextReview: due && l.status === "active" ? "Bugun" : humanize(l.nextReviewAt, now),
      due,
    }
  })
  const topicMap: Record<string, number> = {}
  for (const it of items) topicMap[it.topic] = (topicMap[it.topic] || 0) + 1
  const topics = Object.entries(topicMap)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
  const stats = {
    total: items.length,
    mastered: items.filter((i) => i.status === "mastered").length,
    dueToday: items.filter((i) => i.status === "active" && i.due).length,
    topTopic: topics[0]?.topic || "\u2014",
  }
  return NextResponse.json({ items, stats, topics })
}
