/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    // Allow face-api.js canvas import
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

module.exports = nextConfig;
