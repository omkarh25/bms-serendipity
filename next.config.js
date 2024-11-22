/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your other config
  reactStrictMode: true,
  // Add this to suppress hydration warnings in development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig 