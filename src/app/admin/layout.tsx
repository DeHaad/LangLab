import { redirect } from "next/navigation"
import { getAdminUser } from "@/lib/admin"
import AdminTopbar from "@/components/AdminTopbar"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser()
  if (!admin) redirect("/login")
  return (
    <div className="min-h-screen bg-bg">
      <AdminTopbar name={admin.name} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
