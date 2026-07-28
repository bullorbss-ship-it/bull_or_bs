import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'www.bullorbs.com' }],
      destination: 'https://bullorbs.com/:path*',
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: '/og',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
    },
    {
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],
};

export default nextConfig;
