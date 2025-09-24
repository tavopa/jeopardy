/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://backjeopardy.oke-phx-tst.splata.penoles.mx',
  },
}

module.exports = nextConfig
