/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'dwoikxnpwwd36.cloudfront.net',
            port: '',
            pathname: '/**',
          },
        ],
    },
};

export default nextConfig;
