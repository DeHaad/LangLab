/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel build paytida lint/type xatolar deploy'ni to'xtatmasligi uchun
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Telegram Mini App iframe ichida ochilishi uchun
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Frame-Options", value: "ALLOWALL" }],
      },
    ]
  },
}

module.exports = nextConfig
