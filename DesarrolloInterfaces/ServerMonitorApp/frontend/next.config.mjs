/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    output: 'export', // Re-enabled for Static Site Generation (Essential for 'out/' folder)
    basePath: isProd ? '/ServerMonitorApp/frontend' : '',
    images: {
        unoptimized: true
    }
};

export default nextConfig;
