/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Для Docker: компактная сборка с собственным server.js. На Vercel не мешает.
  output: 'standalone',
};

export default nextConfig;
