import Link from "next/link"
import Icon from "@/components/Icon"

const FEATURES: { icon: string; title: string; desc: string }[] = [
  { icon: "clipboard", title: "Mock testlar", desc: "Telc formatidagi Reading, Writing, Listening" },
  { icon: "sparkles", title: "AI baholash", desc: "Writing javobini ona tilingizda tahlil qiladi" },
  { icon: "refresh", title: "Smart Error Log", desc: "Xatolaringizni takror mashq orqali yodda saqlang" },
  { icon: "book", title: "Lug'at", desc: "Flashcard va interval takrorlash bilan so'z yodlash" },
  { icon: "languages", title: "Grammatika", desc: "Kasus, predloglar va zamonlar bo'yicha mashqlar" },
  { icon: "trophy", title: "Geymifikatsiya", desc: "Streak, reyting va XP bilan motivatsiya" },
]

export default function HomePage() {
  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand2 text-sm font-bold text-white">LL</span>
            <span className="text-xl font-bold text-fg">LangLab</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-outline">Kirish</Link>
            <Link href="/login" className="btn btn-primary">Boshlash</Link>
          </div>
        </header>

        <section className="py-16 text-center sm:py-24">
          <span className="badge badge-beta">🚀 Beta · Telc B1 / B2</span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-fg sm:text-5xl">
            Xalqaro til sertifikatlariga <span className="gradient-text">AI yordamida</span> tayyorlaning
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Nemis tili (Telc B1/B2) bilan boshlaymiz. Mock testlar, AI baholash, aqlli xato jurnali,
            lug'at va grammatika — sayt va Telegram Mini App ko'rinishida.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn btn-primary">
              Bepul boshlash <Icon name="arrow-right" size={18} />
            </Link>
            <Link href="/dashboard" className="btn btn-outline">Demoni ko'rish</Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-glow">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon name={f.icon} size={22} />
              </div>
              <h3 className="mt-3 font-semibold text-fg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </section>

        <footer className="mt-16 border-t border-line py-8 text-center text-sm text-muted">
          © 2026 LangLab — til sertifikatlariga AI yordamida tayyorgarlik
        </footer>
      </div>
    </main>
  )
}
