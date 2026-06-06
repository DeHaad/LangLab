"use client"
import AppShell from "@/components/AppShell"
import ComingSoon from "@/components/ComingSoon"
import { useLang } from "@/lib/LangContext"

export default function AiChatPage() {
  return (
    <AppShell>
      <Inner />
    </AppShell>
  )
}

function Inner() {
  const { t } = useLang()
  return (
    <ComingSoon
      icon="🤖"
      title={t("nav.aichat")}
      subtitle={t("aichat.subtitle")}
      features={[
        { icon: "💬", label: "Telc mavzulari bo'yicha suhbat sherigi" },
        { icon: "✍️", label: "Writing matnini jonli tahrirlash va izoh" },
        { icon: "🗣️", label: "Speaking simulyatsiyasi (Faza 2)" },
        { icon: "📊", label: "Shaxsiy xatolar tahlili asosida mashq" },
      ]}
    />
  )
}
