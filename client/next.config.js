/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Enable static exports for Render.com
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 