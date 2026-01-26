/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/ServerMonitorApp/frontend', // Must match the folder structure in Vercel
    images: {
        unoptimized: true
    }
};

export default nextConfig;
