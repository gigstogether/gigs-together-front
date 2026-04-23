import type { MetadataRoute } from 'next';
import { getPublicAppBaseUrlOrThrow } from '@/env/client-env';

const baseUrl = getPublicAppBaseUrlOrThrow();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/gig-form'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
