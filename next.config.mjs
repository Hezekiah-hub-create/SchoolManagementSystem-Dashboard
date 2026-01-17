/** @type {import('next').NextConfig} */
const nextConfig = {
  turbo: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com', // Covers all pexels subdomains
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      // Add other domains you might use
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
    ],
  },
}

export default nextConfig;
