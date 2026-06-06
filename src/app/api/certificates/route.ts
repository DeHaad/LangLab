import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cached } from "@/lib/redis"

export const dynamic = "force-dynamic"

// Ommaviy: faol sertifikatlar + ularning testlari va savol sonlari
export async function GET() {
  const data = await cached("public:certificates", 120, async () => {
    const certs = await prisma.certificate.findMany({
      where: { isActive: true },
      include: {
        language: { select: { code: true, name: true, flag: true } },
        tests: { select: { id: true, title: true, skill: true, durationMin: true } },
      },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    })
    const grouped = await prisma.question.groupBy({
      by: ["certificateId", "skill"],
      _count: { _all: true },
    })
    const countOf = (certificateId: string, skill: string) =>
      grouped.find((g) => g.certificateId === certificateId && g.skill === skill)?._count._all ?? 0
    return certs.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      level: c.level,
      language: c.language,
      tests: c.tests
        .map((t) => ({
          id: t.id,
          title: t.title,
          skill: t.skill,
          durationMin: t.durationMin,
          questionCount: countOf(c.id, t.skill),
        }))
        .sort((a, b) => a.skill.localeCompare(b.skill)),
    }))
  })
  return NextResponse.json({ certificates: data })
}
