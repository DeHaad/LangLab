import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminApi"

// Tillar ro'yxati
export async function GET() {
  const { res } = await requireAdmin()
  if (res) return res
  const languages = await prisma.language.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json({ languages })
}

// Yangi til qo'shish
export async function POST(req: NextRequest) {
  const { res } = await requireAdmin()
  if (res) return res
  const body = await req.json().catch(() => ({}))
  const { code, name, flag } = body || {}
  if (!code || !name) return NextResponse.json({ error: "code va name majburiy" }, { status: 400 })
  try {
    const language = await prisma.language.create({ data: { code, name, flag: flag || null } })
    return NextResponse.json({ language })
  } catch {
    return NextResponse.json({ error: "Bu kod allaqachon mavjud" }, { status: 400 })
  }
}
