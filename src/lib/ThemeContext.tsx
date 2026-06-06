"use client"
import { createContext, useContext, useEffect, useState } from "react"

export type ThemeMode = "light" | "dark" | "system"

type Ctx = { mode: ThemeMode; setMode: (m: ThemeMode) => void }

const ThemeCtx = createContext<Ctx>({ mode: "system", setMode: () => {} })

function applyTheme(mode: ThemeMode) {
  if (typeof window === "undefined") return
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const dark = mode === "dark" || (mode === "system" && sysDark)
  document.documentElement.classList.toggle("dark", dark)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system")

  useEffect(() => {
    const saved = window.localStorage.getItem("cl_theme") as ThemeMode | null
    const initial = saved ?? "system"
    setModeState(initial)
    applyTheme(initial)
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const cur = (window.localStorage.getItem("cl_theme") as ThemeMode | null) ?? "system"
      if (cur === "system") applyTheme("system")
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const setMode = (m: ThemeMode) => {
    setModeState(m)
    window.localStorage.setItem("cl_theme", m)
    applyTheme(m)
  }

  const value: Ctx = { mode, setMode }
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
