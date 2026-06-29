/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['@astralis/core', '@astralis/types'],
  images: {
    domains: ['t.me', 'cdn.astralis.io'],
  },
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
