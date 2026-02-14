/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optimize font loading
  optimizeFonts: true,

  // Image optimization config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.icloud.com',
      },
    ],
  },

  // Disable font optimization in dev if no internet
  ...(process.env.NODE_ENV === 'development' && {
    optimizeFonts: false,
  }),

  // Experimental features
  experimental: {
    // Enable optimizePackageImports for better bundle size
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      '@auth/prisma-adapter',
      'bcryptjs',
      '@radix-ui/react-icons',
      '@tanstack/react-query',
    ],
  },
};

export default nextConfig;
