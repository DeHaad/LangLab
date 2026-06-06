# CertLingo 🎓

Xalqaro til sertifikatlariga **AI yordamida** tayyorgarlik platformasi. Sayt + Telegram Mini App bitta backend API'dan foydalanadi.

> MVP: **Nemis tili — Telc B1/B2**. Interfeys: 🇺🇿 UZ / 🇷🇺 RU / 🇬🇧 EN.

## 🧱 Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| Frontend + API | Next.js 14 (App Router) + Tailwind |
| Ma'lumotlar bazasi | PostgreSQL + Prisma ORM |
| Kesh / tezlik | Redis (ixtiyoriy, fallback bor) |
| AI baholash | OpenAI (gpt-4o-mini) |
| Bot | Telegram (Telegraf) + Mini App |
| Auth | JWT (jose) + Telegram initData |

## 📁 Struktura

```
certlingo/
  prisma/schema.prisma     # DB sxema (users, questions, attempts, ai_evaluations, ...)
  prisma/seed.ts           # Boshlang'ich ma'lumot (Nemis, Telc B1/B2)
  src/lib/                 # prisma, redis, ai, i18n, telegram, auth
  src/locales/             # uz / ru / en tarjimalar
  src/app/                 # Next.js sahifalar + API routes
    api/auth/telegram      # Telegram login
    api/tests              # testlar ro'yxati (kesh bilan)
    api/attempts           # urinish boshlash + avto tekshirish
    api/evaluate           # AI baholash (freemium limit bilan)
    api/leaderboard        # reyting
  bot/index.ts             # Telegram bot
  docker-compose.yml       # PostgreSQL + Redis
```

## 🚀 Ishga tushirish

```bash
# 1) Paketlar
npm install

# 2) .env tayyorlash
cp .env.example .env   # qiymatlarni to'ldiring

# 3) Baza + Redis (Docker)
docker compose up -d

# 4) Prisma: jadval yaratish + seed
npm run db:push
npm run db:seed

# 5) Saytni ishga tushirish
npm run dev        # http://localhost:3000

# 6) Botni ishga tushirish (alohida terminal)
npm run bot
```

## ✅ Tayyor (MVP)
- Ma'lumotlar bazasi sxemasi (to'liq)
- Telegram orqali kirish (initData tekshiruvi)
- Reading/Listening — avtomatik tekshirish + xato jurnali
- Writing — AI baholash (ona tilida tushuntirish)
- Freemium limit (oyiga 3 ta bepul AI baho)
- Reyting (Redis kesh bilan)
- Ko'p tilli interfeys (UZ/RU/EN)

## 🔜 Coming soon (keyin qo'shiladi)
- 🎧 Listening audio kontenti + S3/R2 fayl ombori
- 🗣️ Speaking (STT + AI ovozli baholash)
- 🎙️ Real-time AI ovozli suhbatdosh (OpenAI Realtime)
- 🎬 Video mikrodarslar, 🎭 roleplay
- 💳 To'lov (Payme/Click/Stripe) integratsiyasi
- 📴 Offline rejim

## 📝 Kontentni to'ldirish
Savollar, lug'at, grammatika `prisma/seed.ts` orqali yoki admin panel orqali kiritiladi.
Hozircha namuna ma'lumotlar bor — real kontentni birga to'ldiramiz.
