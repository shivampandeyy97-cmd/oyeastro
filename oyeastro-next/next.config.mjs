/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['swisseph-wasm', 'pdfkit'],
  },
};

export default nextConfig;
