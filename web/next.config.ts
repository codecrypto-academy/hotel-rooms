import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',

    // Your existing config here...
    experimental: {
        // Add any experimental features you need
    },
    // Add other optimizations
    compress: true,
    poweredByHeader: false,
};

export default nextConfig;
