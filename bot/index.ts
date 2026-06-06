import { Telegraf, Markup } from "telegraf"
import "dotenv/config"

const token = process.env.TELEGRAM_BOT_TOKEN
const webAppUrl = process.env.WEBAPP_URL || ""

if (!token) {
  console.error("\u274c TELEGRAM_BOT_TOKEN topilmadi (.env faylga qo'shing)")
  process.exit(1)
}

const bot = new Telegraf(token)

// Telegram Mini App tugmasi faqat HTTPS manzil bilan ishlaydi.
// localhost (http) bo'lsa, oddiy matn yuboramiz.
const isHttps = webAppUrl.startsWith("https://")

const WELCOME =
  "\ud83c\udf93 LangLab — xalqaro til sertifikatlariga AI yordamida tayyorgarlik.\n\n" +
  "\u2022 Telc, Goethe, IELTS formatidagi testlar\n" +
  "\u2022 AI yozma/og'zaki baholash\n" +
  "\u2022 Aqlli xato jurnali va takrorlash\n\u2022 Lug'at va reyting"

function openKeyboard() {
  return Markup.inlineKeyboard([Markup.button.webApp("\ud83d\ude80 Ilovani ochish", webAppUrl)])
}

// Bot menyusi (buyruqlar) va chat menyu tugmasini sozlash
async function setup() {
  await bot.telegram.setMyCommands([
    { command: "start", description: "Ilovani ochish" },
    { command: "app", description: "Mini App'ni ochish" },
    { command: "help", description: "Yordam" },
  ])
  if (isHttps) {
    await bot.telegram.setChatMenuButton({
      menuButton: { type: "web_app", text: "LangLab", web_app: { url: webAppUrl } },
    })
  }
}

function sendApp(ctx: Parameters<Parameters<typeof bot.start>[0]>[0]) {
  if (isHttps) {
    return ctx.reply(WELCOME + "\n\nQuyidagi tugma orqali ilovani oching:", openKeyboard())
  }
  return ctx.reply(
    WELCOME +
      "\n\n\u26a0\ufe0f Mini App uchun HTTPS manzil kerak (WEBAPP_URL).\n" +
      "Hozircha sayt: " +
      (webAppUrl || "http://localhost:3000"),
  )
}

bot.start((ctx) => sendApp(ctx))
bot.command("app", (ctx) => sendApp(ctx))
bot.command("help", (ctx) =>
  ctx.reply("/start — ilovani ochish\n/app — Mini App'ni ochish\n/help — yordam"),
)

// Xatoda bot butunlay yiqilmasligi uchun
bot.catch((err) => {
  console.error("Bot xatosi:", err)
})

setup().catch((e) => console.error("\u26a0\ufe0f setup xatosi:", e))
bot.launch()
console.log("\u2705 Bot ishga tushdi" + (isHttps ? " (Mini App yoqilgan)" : " (HTTPS yo'q — matn rejimi)"))

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))
