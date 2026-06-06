import { prisma } from "@/lib/prisma"
import Icon from "@/components/Icon"

export const dynamic = "force-dynamic"

const hStyle = (pct: number) => ({ height: `${Math.max(3, pct)}%` })
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export default async function AdminDashboard() {
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - 13)

  const [users, admins, premium, attempts, evals, questions, vocab, certs, recent, payments] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.user.count({ where: { plan: "premium" } }),
    prisma.attempt.count(),
    prisma.aiEvaluation.count(),
    prisma.question.count(),
    prisma.vocabulary.count(),
    prisma.certificate.count(),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.payment.findMany({
      where: { status: "completed" },
      select: { amount: true, currency: true },
    }),
  ])

  const days: { label: string; count: number }[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    const count = recent.filter((u) => sameDay(new Date(u.createdAt), d)).length
    days.push({ label: `${d.getDate()}.${d.getMonth() + 1}`, count })
  }
  const maxCount = Math.max(1, ...days.map((d) => d.count))
  const conversion = users > 0 ? Math.round((premium / users) * 100) : 0
  const revenue = payments.reduce((s, p) => s + p.amount, 0)

  const stats = [
    { icon: "user", label: "Foydalanuvchilar", value: users },
    { icon: "gem", label: "Premium obunalar", value: premium },
    { icon: "clipboard", label: "Test urinishlari", value: attempts },
    { icon: "sparkles", label: "AI baholashlar", value: evals },
    { icon: "book", label: "Lug'at so'zlari", value: vocab },
    { icon: "target", label: "Savollar", value: questions },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-fg">Boshqaruv paneli</h1>
      <p className="mt-1 text-muted">LangLab umumiy ko'rsatkichlari</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card card-glow flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <Icon name={s.icon} size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-fg">{s.value}</div>
              <div className="text-sm text-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-fg">Ro'yxatdan o'tishlar (so'nggi 14 kun)</h2>
          <div className="mt-4 flex h-36 items-end gap-1.5">
            {days.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${d.count}`}>
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t bg-gradient-to-t from-brand to-brand2" style={hStyle((d.count / maxCount) * 100)} />
                </div>
                <span className="text-[10px] text-muted">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 text-muted">
              <Icon name="gem" size={16} /> <span className="text-sm">Premium konversiya</span>
            </div>
            <div className="mt-2 text-3xl font-bold gradient-text">{conversion}%</div>
            <div className="mt-1 text-xs text-muted">{premium} / {users} foydalanuvchi</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 text-muted">
              <Icon name="trophy" size={16} /> <span className="text-sm">Umumiy daromad</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-fg">{(revenue / 100).toLocaleString()} so'm</div>
            <div className="mt-1 text-xs text-muted">{certs} sertifikat · {admins} admin</div>
          </div>
        </div>
      </div>
    </div>
  )
}
