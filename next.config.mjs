import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  // Explicitly tell Webpack to treat pdf-parse as an external (Node.js native require)
  // so it doesn't bundle it — this fixes "pdf-parse did not export a valid function"
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark pdf-parse as external so webpack uses native Node require()
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('pdf-parse');
      }
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: android-webview-video-poster:; connect-src 'self' https://api.anthropic.com; media-src 'self'; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
