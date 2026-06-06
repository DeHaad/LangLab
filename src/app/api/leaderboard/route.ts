import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cached } from "@/lib/redis"

// Reyting (XP bo'yicha) — 60 soniya kesh
export async function GET() {
  const top = await cached("leaderboard:top", 60, () =>
    prisma.user.findMany({
      select: { id: true, name: true, xp: true, streak: true },
      orderBy: { xp: "desc" },
      take: 20,
    }),
  )
  return NextResponse.json({ leaderboard: top })
}
