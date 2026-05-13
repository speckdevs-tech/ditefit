/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/dite-fit',
  assetPrefix: '/dite-fit/',
  images: {
    unoptimized: true,
  },
}

export default nextConfig