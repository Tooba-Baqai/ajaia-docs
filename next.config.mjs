/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
    '/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
  },
};

export default nextConfig;
