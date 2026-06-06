import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import TelegramInit from "@/components/TelegramInit"

export const metadata: Metadata = {
  title: "LangLab — til sertifikatlariga tayyorgarlik",
  description: "AI yordamida xalqaro til sertifikatlariga tayyorgarlik. Sayt + Telegram Mini App.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramInit />
        {children}
      </body>
    </html>
  )
}
