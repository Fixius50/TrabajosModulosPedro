/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    // output: 'export', // Disabled to allow Dynamic API Routes (CVE Proxy)
    basePath: isProd ? '/ServerMonitorApp/frontend' : '',
    images: {
        unoptimized: true
    }
};

export default nextConfig;
