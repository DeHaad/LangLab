import { prisma } from "@/lib/prisma"
import ContentManager from "@/components/admin/ContentManager"

export const dynamic = "force-dynamic"

export default async function AdminTests() {
  const [languages, certificates, tests] = await Promise.all([
    prisma.language.findMany({ orderBy: { name: "asc" } }),
    prisma.certificate.findMany({
      include: { language: true, _count: { select: { questions: true, tests: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.test.findMany({ orderBy: { title: "asc" } }),
  ])
  return (
    <div>
      <h1 className="text-2xl font-bold text-fg">Testlar va sertifikatlar</h1>
      <p className="mt-1 text-muted">Tillar, sertifikatlar (Telc/Goethe) va testlarni boshqaring.</p>
      <ContentManager languages={languages} certificates={certificates} tests={tests} />
    </div>
  )
}
