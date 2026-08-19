/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.226:3000",
    "http://0.0.0.0:3000",
  ],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
