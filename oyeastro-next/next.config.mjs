/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['swisseph-wasm'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/pdfkit/js/data/*.afm'],
    },
  },
};

export default nextConfig;
