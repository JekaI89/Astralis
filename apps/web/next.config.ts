import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@astralis/core', '@astralis/types'],
  images: {
    domains: ['t.me', 'cdn.astralis.io'],
  },
  // Разрешаем встраивание в Telegram WebView
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://web.telegram.org https://t.me" },
        ],
      },
    ]
  },
}

export default config
