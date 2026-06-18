import type { MetadataRoute } from 'next';
import { getAppBaseUrlOrThrow } from '@/env/server-env';

const baseUrl = getAppBaseUrlOrThrow();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
