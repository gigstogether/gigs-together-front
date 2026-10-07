const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const DEFAULT_FEED_PATH = '/feed/es/barcelona';
const DEFAULT_FEED_ALIASES = ['/', '/feed', '/feed/es', '/feed/barcelona'];

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true, // prevents from adding a wrong href to Link in routes
  reactCompiler: true,
  allowedDevOrigins,
  logging: {
    browserToTerminal: false,
  },
  async redirects() {
    return DEFAULT_FEED_ALIASES.map((source) => ({
      source,
      destination: DEFAULT_FEED_PATH,
      permanent: true,
    }));
  },
  async rewrites() {
    return [
      {
        source: '/llms.txt',
        destination: '/llms-txt',
      },
    ];
  },
};

export default nextConfig;
