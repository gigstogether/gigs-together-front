const allowedDevOrigins = process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true, // prevents from adding a wrong href to Link in routes
  reactCompiler: true,
  allowedDevOrigins,
};

export default nextConfig;
