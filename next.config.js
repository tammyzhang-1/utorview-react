/** @type {import('next').NextConfig} */
const nextConfig = {}

// module.exports = nextConfig

module.exports = {
    async rewrites() {
      return [
        {
          source: '/request/:path*',
          destination: 'https://wofsdltornado.blob.core.windows.net/:path*'
        }
      ]
    }
  }
