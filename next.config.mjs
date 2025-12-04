/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbopack: {
      resolveAlias: {
        // Ignore server-side logging modules
        'pino-pretty': false,
        'thread-stream': false,
      },
    },
  },
}

export default nextConfig
