/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'assets.web3pay.io',
            port: '',
            pathname: '/**',
          },
        ],
    },
};

export default nextConfig;
