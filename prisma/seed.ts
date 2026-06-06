import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // 1) Til: Nemis (MVP)
  const de = await prisma.language.upsert({
    where: { code: "de" },
    update: {},
    create: { code: "de", name: "Nemis tili", flag: "🇩🇪" },
  })

  // 2) Sertifikatlar: Telc B1 / B2
  const telcB1 = await prisma.certificate.upsert({
    where: { languageId_code: { languageId: de.id, code: "telc_b1" } },
    update: {},
    create: { languageId: de.id, code: "telc_b1", name: "Telc B1", level: "B1" },
  })
  const telcB2 = await prisma.certificate.upsert({
    where: { languageId_code: { languageId: de.id, code: "telc_b2" } },
    update: {},
    create: { languageId: de.id, code: "telc_b2", name: "Telc B2", level: "B2" },
  })

  // 3) Namuna savol (Reading) — kontent keyin to'ldiriladi
  const q = await prisma.question.create({
    data: {
      languageId: de.id,
      certificateId: telcB1.id,
      skill: "reading",
      level: "B1",
      prompt: "Lesen Sie den Text und beantworten Sie die Frage.",
      passage: "(Namuna matn — real kontent keyin qo'shiladi)",
      options: ["A", "B", "C"],
      correctAnswer: "A",
      points: 1,
    },
  })

  // 4) Namuna Writing topshirig'i
  await prisma.question.create({
    data: {
      languageId: de.id,
      certificateId: telcB1.id,
      skill: "writing",
      level: "B1",
      prompt: "Schreiben Sie eine E-Mail an einen Freund (mind. 80 Worter).",
      rubric: "Mavzuga moslik, grammatika, lug'at boyligi, struktura.",
      points: 100,
    },
  })

  // 5) Namuna test
  await prisma.test.create({
    data: { certificateId: telcB1.id, skill: "reading", title: "Telc B1 — Lesen (namuna)", durationMin: 30 },
  })

  // 6) Namuna lug'at
  await prisma.vocabulary.create({
    data: { languageId: de.id, level: "B1", word: "die Pruefung", translation: "imtihon", example: "Die Pruefung ist schwer.", topic: "Ta'lim" },
  })

  console.log("Seed tayyor:", { de: de.code, telcB1: telcB1.code, telcB2: telcB2.code, q: q.id })
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
