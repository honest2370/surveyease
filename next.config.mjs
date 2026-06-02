// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow embedding from RapidoReach survey domain
  async headers() {
    return [
      {
        source: "/api/webhooks/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  // Allow RapidoReach iframe to load
  async rewrites() {
    return [];
  },
};

export default nextConfig;
