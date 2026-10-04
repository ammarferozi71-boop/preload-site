/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  ...(process.env.PIXELFORGE_LOCAL_BUILD === '1' ? { experimental: { workerThreads: true, cpus: 2 } } : {}),
};

module.exports = nextConfig;
