import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // Git Smart HTTP: /<owner>/<repo>.git/* -> /api/git/<owner>/<repo>.git/*
      {
        source: '/:owner/:repo(\\.git)/:path*',
        destination: '/api/git/:owner/:repo/:path*',
      },
      // Git Smart HTTP (without trailing path)
      {
        source: '/:owner/:repo(\\.git)',
        destination: '/api/git/:owner/:repo',
      },
    ];
  },
};

export default nextConfig;
