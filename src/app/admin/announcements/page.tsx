import AnnouncementManager from "@/components/admin/AnnouncementManager"

export const dynamic = "force-dynamic"

export default function AdminAnnouncements() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-fg">E'lonlar</h1>
      <p className="mt-1 text-muted">Foydalanuvchilarga ko'rinadigan e'lonlar (yangiliklar, eslatmalar).</p>
      <AnnouncementManager />
    </div>
  )
}
