import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',

    images: {
    remotePatterns: [
        {
            protocol: 'http',
            hostname: 'server.codecrypto.academy',
            port: '',
            pathname: '/images/**',
        },
    ],
    },

    // Your existing config here...
    experimental: {
        // Add any experimental features you need
    },
    // Add other optimizations
    compress: true,
    poweredByHeader: false,
};

export default nextConfig;
