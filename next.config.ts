import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),  // Uncomment and add 'import path from "path"' if needed
  /* config options here */
  serverExternalPackages: ['coze-coding-dev-sdk'],
  // Keep long-running dev chunks separate from production builds. Sharing one
  // directory lets `next build` invalidate chunks held by an open preview tab.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  turbopack: { root: import.meta.dirname },
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
