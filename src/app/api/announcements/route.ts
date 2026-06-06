import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Ommaviy: faqat faol e'lonlar (foydalanuvchi ilovasi uchun)
export async function GET() {
  const announcements = await prisma.announcement.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, body: true, createdAt: true },
  })
  return NextResponse.json({ announcements })
}
