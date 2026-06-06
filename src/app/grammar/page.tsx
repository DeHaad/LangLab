"use client"
import AppShell from "@/components/AppShell"
import ComingSoon from "@/components/ComingSoon"
import { useLang } from "@/lib/LangContext"

export default function GrammarPage() {
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
      icon="🧩"
      title={t("nav.grammar")}
      subtitle={t("grammar.subtitle")}
      features={[
        { icon: "📐", label: "Kasus mashqlari: Nominativ · Akkusativ · Dativ · Genitiv" },
        { icon: "🔗", label: "Präpositionen va Wechselpräpositionen" },
        { icon: "⏳", label: "Zamonlar: Perfekt, Präteritum, Plusquamperfekt" },
        { icon: "🧠", label: "Interaktiv qoidalar + darhol AI tushuntirish" },
      ]}
    />
  )
}
