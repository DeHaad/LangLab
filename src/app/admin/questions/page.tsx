import { prisma } from "@/lib/prisma"
import QuestionManager from "@/components/admin/QuestionManager"

export const dynamic = "force-dynamic"

export default async function AdminQuestions() {
  const certificates = await prisma.certificate.findMany({
    include: { language: true },
    orderBy: { name: "asc" },
  })
  return (
    <div>
      <h1 className="text-2xl font-bold text-fg">Savollar banki</h1>
      <p className="mt-1 text-muted">Har bir sertifikat uchun savollar qo'shing, tahrirlang va o'chiring.</p>
      <QuestionManager certificates={certificates} />
    </div>
  )
}
