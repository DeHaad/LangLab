# LangLab — Vercel'ga deploy qilish (doimiy HTTPS)

Vercel saytni (Next.js + Mini App) hostlaydi va doimiy HTTPS manzil beradi.
Tunnel (cloudflared) kerak emas.

> Eslatma: Telegram **bot polling jarayoni** (`npm run bot`) Vercel'da uzluksiz
> ishlamaydi (serverless). Lekin Mini App'ni BotFather menyu tugmasi orqali
> ochish uchun bot jarayoni shart emas (5-bo'limga qarang).

---

## 1. Hostlangan Postgres bazasini oching (bepul)

Vercel serverless bo'lgani uchun bulutdagi Postgres kerak. Eng oson — **Neon**:

1. https://neon.tech ga kiring → bepul loyiha yarating.
2. "Connection string"ni nusxalang. U shunga o'xshaydi:
   ```
   postgresql://USER:PASSWORD@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Shu satrni `DATABASE_URL` sifatida saqlab qo'ying (keyin Vercel'ga yozamiz).

(Muqobil: Vercel Postgres, Supabase yoki Railway Postgres ham bo'ladi.)

---

## 2. Bazaga sxema va boshlang'ich ma'lumotni yuklang (lokal kompyuterdan)

Lokal terminalda, loyiha papkasida, vaqtincha production bazaga ulanib:

```bash
cd ~/Downloads/langlab

# Production bazaga ulanib sxemani yuklash:
DATABASE_URL="postgresql://...neon.../neondb?sslmode=require" npx prisma db push

# (ixtiyoriy) Boshlang'ich ma'lumot:
DATABASE_URL="postgresql://...neon.../neondb?sslmode=require" npm run db:seed
```

Bu jadval va dastlabki sertifikat/savollarni production bazaga yozadi.

---

## 3. Kodni GitHub'ga joylang

```bash
cd ~/Downloads/langlab
git init        # agar hali bo'lmasa
git add .
git commit -m "LangLab deploy"
# GitHub'da bo'sh repo yarating, so'ng:
git remote add origin https://github.com/FOYDALANUVCHI/langlab.git
git push -u origin main
```

> `.gitignore` da `node_modules`, `.next`, `.env` borligiga ishonch hosil qiling
> (`.env` ni hech qachon push qilmang!).

---

## 4. Vercel'da loyihani import qiling

1. https://vercel.com → "Add New… → Project" → GitHub repongizni tanlang.
2. Framework avtomatik **Next.js** deb aniqlanadi. Build sozlamalariga tegmang
   (build skripti allaqachon `prisma generate && next build`).
3. **Environment Variables** bo'limiga quyidagilarni qo'shing:

   | Nomi | Qiymati |
   |------|---------|
   | `DATABASE_URL` | Neon connection string (2-bo'limdagi) |
   | `JWT_SECRET` | uzun tasodifiy maxfiy satr |
   | `OPENAI_API_KEY` | `sk-...` (AI baholash uchun; ixtiyoriy) |
   | `OPENAI_MODEL` | `gpt-4o-mini` |
   | `TELEGRAM_BOT_TOKEN` | BotFather bergan token |
   | `TELEGRAM_BOT_USERNAME` | masalan `langlab_bot` |
   | `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | masalan `langlab_bot` |
   | `WEBAPP_URL` | deploydan keyingi Vercel manzili (avval bo'sh qoldiring, keyin yangilang) |
   | `FREE_AI_EVALS_PER_MONTH` | `3` |
   | `ADMIN_TELEGRAM_IDS` | `5693952593` |
   | `REDIS_URL` | (ixtiyoriy — bo'sh qoldirsangiz keshsiz ishlaydi) |

4. **Deploy** bosing. Tugagach `https://langlab-xxxx.vercel.app` manzilini olasiz.
5. Shu manzilni `WEBAPP_URL` ga yozib, qayta deploy qiling (Settings → Environment
   Variables → yangilang → Redeploy).

---

## 5. Telegram Mini App'ni ulash (BotFather)

Vercel manzili tayyor bo'lgach, @BotFather'da:

1. `/mybots` → botingizni tanlang → **Bot Settings → Menu Button → Configure menu button**
   → URL'ga Vercel manzilini kiriting (`https://langlab-xxxx.vercel.app`).
2. (Ixtiyoriy, alohida Mini App uchun) `/newapp` → botni tanlang → nom, rasm va
   URL sifatida o'sha Vercel manzilini bering.

Endi Telegramda botni oching → pastdagi **menyu tugmasi** Mini App'ni ochadi.
Ilova ichida `TelegramInit` avtomatik kirishni bajaradi → to'g'ridan dashboard.

> `/start` buyrug'iga tugmali javob ham kerak bo'lsa, `npm run bot` ni doimiy
> ishlaydigan joyda (lokal kompyuter yoki Railway/Render) `WEBAPP_URL` = Vercel
> manzili bilan ishga tushiring. Mini App'ning ishlashi uchun bu **shart emas**.

---

## 6. Tekshirish

- Brauzerda `https://langlab-xxxx.vercel.app` ochiladimi?
- Telegramda menyu tugmasi → ilova ochiladimi va avtomatik kirasizmi?
- Test ishlab ko'ring → natija, xato jurnali, dashboard to'ladimi?

Biror bosqichda xato chiqsa, xabarini yuboring — birga hal qilamiz.
