import OpenAI from "openai"
import type { Skill, UiLocale } from "@prisma/client"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"

const LOCALE_NAME: Record<UiLocale, string> = {
  uz: "o'zbek",
  ru: "russkom",
  en: "English",
}

export type Correction = { original: string; suggestion: string; explanation: string }
export type EvaluationResult = {
  score: number
  maxScore: number
  feedback: string
  corrections: Correction[]
}

// Writing / Speaking transkriptini Telc mezonlari bo'yicha baholaydi.
// Tushuntirish foydalanuvchining interfeys tilida qaytariladi.
export async function evaluateWriting(params: {
  skill: Skill
  level: string
  prompt: string
  rubric?: string | null
  response: string
  uiLocale: UiLocale
}): Promise<EvaluationResult> {
  const { skill, level, prompt, rubric, response, uiLocale } = params

  const system = [
    `Siz Telc ${level} darajasidagi imtihon ekspertisiz.`,
    `Talabaning ${skill} javobini baholang.`,
    `Maksimal ball: 100. Ob'ektiv, lekin rag'batlantiruvchi bo'ling.`,
    `Barcha fikr-mulohaza va tushuntirishlarni ${LOCALE_NAME[uiLocale]} tilida yozing.`,
    `Faqat quyidagi JSON sxemada javob bering:`,
    `{"score": number, "maxScore": 100, "feedback": string, "corrections": [{"original": string, "suggestion": string, "explanation": string}]}`,
  ].join(" ")

  const user = [
    `Topshiriq: ${prompt}`,
    rubric ? `Baholash mezoni: ${rubric}` : "",
    `Talaba javobi:\n${response}`,
  ].filter(Boolean).join("\n\n")

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  })

  const raw = completion.choices[0]?.message?.content || "{}"
  const parsed = JSON.parse(raw) as EvaluationResult
  return {
    score: Math.max(0, Math.min(100, parsed.score ?? 0)),
    maxScore: parsed.maxScore ?? 100,
    feedback: parsed.feedback ?? "",
    corrections: parsed.corrections ?? [],
  }
}
