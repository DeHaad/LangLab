import { prisma } from "@/lib/prisma"
import VocabularyManager from "@/components/admin/VocabularyManager"

export const dynamic = "force-dynamic"

export default async function AdminVocabulary() {
  const languages = await prisma.language.findMany({ orderBy: { name: "asc" } })
  return (
    <div>
      <h1 className="text-2xl font-bold text-fg">Lug'at boshqaruvi</h1>
      <p className="mt-1 text-muted">So'zlarni qo'shing, tahrirlang yoki CSV/Excel orqali ommaviy yuklang.</p>
      <VocabularyManager languages={languages} />
    </div>
  )
}
