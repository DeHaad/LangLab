import crypto from "crypto"

// Telegram Mini App initData ni tekshirish (rasmiy algoritm)
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export function verifyTelegramInitData(initData: string, botToken: string): null | {
  id: string
  first_name?: string
  last_name?: string
  username?: string
} {
  const params = new URLSearchParams(initData)
  const hash = params.get("hash")
  if (!hash) return null
  params.delete("hash")

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n")

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest()
  const computed = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")
  if (computed !== hash) return null

  const userRaw = params.get("user")
  if (!userRaw) return null
  const user = JSON.parse(userRaw)
  return { id: String(user.id), first_name: user.first_name, last_name: user.last_name, username: user.username }
}
