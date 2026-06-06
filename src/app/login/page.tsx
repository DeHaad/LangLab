"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Icon from "@/components/Icon"

export default function LoginPage() {
  const router = useRouter()
  const [signUp, setSignUp] = useState(false)
  const botLink = "https://t.me/" + (process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "certlingo_bot")
  const go = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      localStorage.setItem("ll_auth", "1")
    } catch {}
    router.push("/dashboard")
  }
  const devAdmin = async () => {
    try {
      await fetch("/api/auth/dev-login", { method: "POST" })
    } catch {}
    router.push("/admin")
  }
  return (
    <div className="auth-wrapper">
      <div className={`auth-container ${signUp ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <form className="auth-form sign-in-form" onSubmit={go}>
              <div className="auth-logo">
                <span className="auth-logo-badge">LL</span>
                <span>LangLab</span>
              </div>
              <h2 className="auth-title">Xush kelibsiz!</h2>
              <p className="auth-subtitle">Hisobingizga kiring va tayyorgarlikni davom eting</p>
              <div className="auth-input-wrap">
                <span className="auth-ic"><Icon name="mail" size={18} /></span>
                <input type="email" placeholder="Email" required />
              </div>
              <div className="auth-input-wrap">
                <span className="auth-ic"><Icon name="lock" size={18} /></span>
                <input type="password" placeholder="Parol" required />
              </div>
              <button className="auth-btn" type="submit">Kirish</button>
              <p className="social-text">yoki Telegram orqali</p>
              <a className="tg-circle" href={botLink} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><Icon name="telegram" size={20} /></a>
              <button type="button" className="auth-mobile-toggle" onClick={() => setSignUp(true)}>
                Hisobingiz yo'qmi? Ro'yxatdan o'ting
              </button>
            </form>

            <form className="auth-form sign-up-form" onSubmit={go}>
              <div className="auth-logo">
                <span className="auth-logo-badge">LL</span>
                <span>LangLab</span>
              </div>
              <h2 className="auth-title">Hisob yaratish</h2>
              <p className="auth-subtitle">Bir daqiqada ro'yxatdan o'ting</p>
              <div className="auth-input-wrap">
                <span className="auth-ic"><Icon name="user" size={18} /></span>
                <input type="text" placeholder="Ismingiz" required />
              </div>
              <div className="auth-input-wrap">
                <span className="auth-ic"><Icon name="mail" size={18} /></span>
                <input type="email" placeholder="Email" required />
              </div>
              <div className="auth-input-wrap">
                <span className="auth-ic"><Icon name="lock" size={18} /></span>
                <input type="password" placeholder="Parol" required />
              </div>
              <button className="auth-btn" type="submit">Ro'yxatdan o'tish</button>
              <p className="social-text">yoki Telegram orqali</p>
              <a className="tg-circle" href={botLink} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><Icon name="telegram" size={20} /></a>
              <button type="button" className="auth-mobile-toggle" onClick={() => setSignUp(false)}>
                Hisobingiz bormi? Kiring
              </button>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="panel-content">
              <h3>LangLab'da yangimisiz?</h3>
              <p>Ro'yxatdan o'ting va Telc B1/B2 ga AI yordamida tayyorgarlikni boshlang.</p>
              <button className="auth-btn-outline" type="button" onClick={() => setSignUp(true)}>Ro'yxatdan o'tish</button>
            </div>
          </div>
          <div className="panel right-panel">
            <div className="panel-content">
              <h3>Allaqachon a'zomisiz?</h3>
              <p>Hisobingizga kiring va to'xtagan joyingizdan davom eting.</p>
              <button className="auth-btn-outline" type="button" onClick={() => setSignUp(false)}>Kirish</button>
            </div>
          </div>
        </div>
      </div>
      {process.env.NODE_ENV !== "production" && (
        <button
          type="button"
          onClick={devAdmin}
          className="fixed bottom-4 right-4 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white"
        >
          🔧 Dev: admin sifatida kirish
        </button>
      )}
    </div>
  )
}
