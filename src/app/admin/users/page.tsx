import { prisma } from "@/lib/prisma"
import UsersTable from "@/components/admin/UsersTable"

export const dynamic = "force-dynamic"

export default async function AdminUsers() {
  const raw = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 200 })
  const users = raw.map((u) => ({
    id: u.id,
    name: u.name,
    telegramId: u.telegramId,
    email: u.email,
    plan: u.plan,
    role: u.role,
    xp: u.xp,
    createdAt: u.createdAt.toISOString(),
  }))
  return (
    <div>
      <h1 className="text-2xl font-bold text-fg">Foydalanuvchilar</h1>
      <p className="mt-1 text-muted">Reja va rolni bevosita o'zgartiring (Premium berish / admin tayinlash).</p>
      <UsersTable initial={users} />
    </div>
  )
}
