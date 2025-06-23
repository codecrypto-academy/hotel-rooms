import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',

    // Your existing config here...
    experimental: {
        // Add any experimental features you need
    },

    // Optimize for production
    swcMinify: true,

    // Add other optimizations
    compress: true,
    poweredByHeader: false,
};

export default nextConfig;
