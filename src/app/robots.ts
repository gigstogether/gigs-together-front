import type { MetadataRoute } from 'next';
import { getAppBaseUrlOrThrow, serverEnv } from '@/env/server-env';

export default function robots(): MetadataRoute.Robots {
  if (!serverEnv.isProductionSite) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  const baseUrl = getAppBaseUrlOrThrow();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
