/** @type {import('next').NextStyle} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;