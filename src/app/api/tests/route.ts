import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cached } from "@/lib/redis"

// Sertifikat bo'yicha testlar ro'yxati (kesh bilan)
export async function GET(req: NextRequest) {
  const certificateId = req.nextUrl.searchParams.get("certificateId")
  if (!certificateId) return NextResponse.json({ error: "certificateId kerak" }, { status: 400 })

  const tests = await cached(`tests:${certificateId}`, 300, () =>
    prisma.test.findMany({
      where: { certificateId },
      select: { id: true, title: true, skill: true, durationMin: true },
      orderBy: { skill: "asc" },
    }),
  )
  return NextResponse.json({ tests })
}
