/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    //NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://backjeopardy.oke-phx-tst.splata.penoles.mx',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
