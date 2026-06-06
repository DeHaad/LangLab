"use client"
import { createContext, useContext, useEffect, useState } from "react"
import uz from "@/locales/uz.json"
import ru from "@/locales/ru.json"
import en from "@/locales/en.json"

export type Locale = "uz" | "ru" | "en"

const dicts: Record<Locale, Record<string, string>> = { uz, ru, en }

export const localeNames: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
}

type Ctx = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (k: string) => string
}

const LangCtx = createContext<Ctx>({
  locale: "uz",
  setLocale: () => {},
  t: (k) => k,
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("uz")

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem("cl_locale") as Locale | null
    if (saved && dicts[saved]) setLocaleState(saved)
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    if (typeof window !== "undefined") window.localStorage.setItem("cl_locale", l)
  }

  const t = (k: string) => dicts[locale]?.[k] ?? dicts.uz[k] ?? k

  const value: Ctx = { locale, setLocale, t }

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)
