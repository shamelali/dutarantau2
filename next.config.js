/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false,
    turbo: {
      rules: {
        // Optimization rules for production
        "^src/app/(.*)$": {
          loaders: ["@next/swc"],
        },
      },
    },
  },
  images: {
    domains: ["api.dicebear.com", "cdn.pixabay.com"],
    // Allow all domains for DUTA RANTAU image assets
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Security headers for all routes
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
      {
        // Caching for static assets
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // API route security
        source: "/api/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Aliases for cleaner URLs
      {
        source: "/masuk-daftar",
        destination: "/api/auth/login", // or "/auth/login"
      },
      {
        source: "/",
        destination: "/", // Root remains root
      },
    ];
  },
  // Disable x-powered-by header
  poweredByHeader: false,
};

// Disable static image optimization that might cause issues
nextConfig.images = {
  ...nextConfig.images,
  // Disable during development, enable for production
  // domains: ['api.dicebear.com'],
};

module.exports = nextConfig;
