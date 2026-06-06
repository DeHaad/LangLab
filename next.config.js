/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Telegram Mini App iframe ichida ochilishi uchun
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
        ],
      },
    ]
  },
}

module.exports = nextConfig
