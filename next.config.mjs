/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true, // prevents from adding a wrong href to Link in routes
  reactCompiler: true,
};

export default nextConfig;
