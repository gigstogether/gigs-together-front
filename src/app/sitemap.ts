import type { MetadataRoute } from 'next';
import { getAppBaseUrlOrThrow, serverEnv } from '@/env/server-env';
import { buildFeedPath } from '@/lib/feed/feed.routes';
import { getCommunities } from '@/lib/community/community.server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!serverEnv.isProductionSite) {
    return [];
  }

  const baseUrl = getAppBaseUrlOrThrow();
  const catalog = await getCommunities();
  const feedUrls = catalog.communities.map((community) => ({
    url: `${baseUrl}${buildFeedPath({
      country: community.countryIso,
      communitySlug: community.slug,
    })}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...feedUrls,
  ];
}
