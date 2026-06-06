// Demo/struktura ma'lumotlari. Haqiqiy savol banki, lug'at va reyting DB dan keladi.
// Quyidagi massivlar ATAYLAB bo'sh — haqiqiy ma'lumotlar joylanguncha sahifalar "empty state" ko'rsatadi.

export type TestSection = {
  id: string
  icon: string
  title: string
  desc: string
  questions: number
  minutes: number
  soon: boolean
  type: "reading" | "writing"
}

// Telc bo'lim turlari (struktura). questions = 0 — haqiqiy savollar keyin qo'shiladi.
export const TEST_SECTIONS: TestSection[] = [
  { id: "reading-b1", icon: "📖", title: "Reading (Lesen) B1", desc: "Avtomatik tekshiriladi", questions: 0, minutes: 30, soon: false, type: "reading" },
  { id: "writing-b1", icon: "✍️", title: "Writing (Schreiben) B1", desc: "AI baholash", questions: 0, minutes: 30, soon: false, type: "writing" },
  { id: "listening-b1", icon: "🎧", title: "Listening (Hören) B1", desc: "Audio tayyorlanmoqda", questions: 0, minutes: 25, soon: true, type: "reading" },
  { id: "speaking-b1", icon: "🗣️", title: "Speaking (Sprechen) B1", desc: "AI ovozli baholash", questions: 0, minutes: 15, soon: true, type: "writing" },
]

export type ReadingQuestion = {
  passage: string
  question: string
  options: string[]
  correct: number
}

// Haqiqiy o'qish savollari ertaga joylanadi.
export const READING_DEMO: ReadingQuestion[] = []

// Haqiqiy yozma topshiriq ertaga joylanadi.
export const WRITING_PROMPT = {
  title: "",
  body: "",
}

export type VocabCard = { word: string; translation: string; example: string }

// Haqiqiy lug'at to'plami ertaga joylanadi.
export const VOCAB_DECK: VocabCard[] = []

export type Leader = { name: string; points: number; you?: boolean }

// Reyting haqiqiy foydalanuvchilardan to'planadi.
export const LEADERBOARD: Leader[] = []

// ---- Aqlli Xato Jurnali (Smart Error Log) demo ----
export type ErrorItem = {
  id: string
  topic: string
  tags: string[]
  question: string
  yourAnswer: string
  correctAnswer: string
  explanation: string
  repetition: number // 0..4: 1 soat -> 1 kun -> 3 kun -> 1 hafta -> 1 oy
  nextReview: string
  status: "active" | "mastered"
}

export const REVIEW_STEPS = ["1 soat", "1 kun", "3 kun", "1 hafta", "1 oy"]

export const ERROR_LOG: ErrorItem[] = [
  {
    id: "e1",
    topic: "Präpositionen",
    tags: ["Präposition", "Akkusativ"],
    question: "Ich warte ___ den Bus.",
    yourAnswer: "auf dem Bus",
    correctAnswer: "auf den Bus",
    explanation: "«warten auf» fe'li doim Akkusativ talab qiladi. «der Bus» erkak rodda, Akkusativda «den Bus» bo'ladi. To'g'risi: auf den Bus.",
    repetition: 1,
    nextReview: "Bugun",
    status: "active",
  },
  {
    id: "e2",
    topic: "Artikel (der/die/das)",
    tags: ["Artikel", "Genus"],
    question: "___ Mädchen ist klein.",
    yourAnswer: "Die Mädchen",
    correctAnswer: "Das Mädchen",
    explanation: "«Mädchen» -chen qo'shimchasi bilan tugagani uchun har doim neutral (das) — ma'no jihatdan qiz bo'lsa ham. Barcha -chen/-lein so'zlar das oladi.",
    repetition: 0,
    nextReview: "Bugun",
    status: "active",
  },
  {
    id: "e3",
    topic: "Adjektivdeklination",
    tags: ["Adjektiv", "Nominativ"],
    question: "Das ist ein ___ Mann. (gut)",
    yourAnswer: "ein gute Mann",
    correctAnswer: "ein guter Mann",
    explanation: "Noaniq artikel «ein» bilan erkak rod Nominativda sifat -er qo'shimchasini oladi: ein guter Mann.",
    repetition: 2,
    nextReview: "Ertaga",
    status: "active",
  },
  {
    id: "e4",
    topic: "Trennbare Verben",
    tags: ["Verb", "Wortstellung"],
    question: "Ich ___ um 7 Uhr ___ . (aufstehen)",
    yourAnswer: "aufstehe / —",
    correctAnswer: "stehe / auf",
    explanation: "«aufstehen» ajraladigan fe'l. Asosiy gapda prefiks (auf) gap oxiriga ketadi: Ich stehe um 7 Uhr auf.",
    repetition: 1,
    nextReview: "Bugun",
    status: "active",
  },
  {
    id: "e5",
    topic: "Konjunktiv II",
    tags: ["Konjunktiv", "Höflichkeit"],
    question: "___ ich bitte ein Wasser haben?",
    yourAnswer: "Kann",
    correctAnswer: "Könnte",
    explanation: "Xushmuomala iltimos uchun Konjunktiv II ishlatiladi: «Könnte ich ...?» — «Kann» dan ko'ra muloyimroq eshitiladi.",
    repetition: 0,
    nextReview: "Bugun",
    status: "active",
  },
  {
    id: "e6",
    topic: "Perfekt/Präteritum",
    tags: ["Perfekt", "Partizip II"],
    question: "Gestern ___ ich ins Kino gegangen.",
    yourAnswer: "habe",
    correctAnswer: "bin",
    explanation: "Harakat / joy o'zgarishi fe'llari Perfektda «sein» bilan keladi: «gehen» → ich bin gegangen.",
    repetition: 4,
    nextReview: "3 hafta",
    status: "mastered",
  },
  {
    id: "e7",
    topic: "Präpositionen",
    tags: ["Präposition", "Dativ"],
    question: "Ich fahre ___ Bus zur Arbeit.",
    yourAnswer: "mit den",
    correctAnswer: "mit dem",
    explanation: "«mit» doim Dativ oladi. «der Bus» Dativda «dem Bus»: mit dem Bus.",
    repetition: 4,
    nextReview: "1 oy",
    status: "mastered",
  },
]

export const ERROR_STATS = {
  total: ERROR_LOG.length,
  mastered: ERROR_LOG.filter((e) => e.status === "mastered").length,
  dueToday: ERROR_LOG.filter((e) => e.status === "active").length,
  topTopic: "Präpositionen",
}

export const TOPIC_BREAKDOWN: { topic: string; count: number }[] = [
  { topic: "Präpositionen", count: 6 },
  { topic: "Artikel (der/die/das)", count: 4 },
  { topic: "Konjunktiv II", count: 3 },
  { topic: "Perfekt/Präteritum", count: 3 },
  { topic: "Adjektivdeklination", count: 2 },
]

export const REVIEW_QUEUE: ErrorItem[] = ERROR_LOG.filter((e) => e.status === "active").slice(0, 5)
