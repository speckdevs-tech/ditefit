/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/ditefit',
  assetPrefix: '/ditefit/',
  images: {
    unoptimized: true,
  },
}

export default nextConfig