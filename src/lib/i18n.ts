import uz from "@/locales/uz.json"
import ru from "@/locales/ru.json"
import en from "@/locales/en.json"

export type Locale = "uz" | "ru" | "en"
export const locales: Locale[] = ["uz", "ru", "en"]
export const defaultLocale: Locale = "uz"

const dictionaries = { uz, ru, en } as const

export function t(locale: Locale, key: string): string {
  const dict = dictionaries[locale] as Record<string, string>
  return dict[key] ?? (dictionaries.uz as Record<string, string>)[key] ?? key
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.uz
}
