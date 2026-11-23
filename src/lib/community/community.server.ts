import 'server-only';

import { fetchCommunities } from '@/lib/community/community.api';
import type { CommunitiesResponse, Community } from '@/lib/api-boundary-schemas';

const COMMUNITY_CATALOG_REVALIDATE_SECONDS = 60; // 60 seconds (1 minute)

export interface CommunityRouteParams {
  country: string;
  communitySlug: string;
}

export interface ResolvedCommunityRoute {
  community: Community;
  nameTranslationNamespace: string;
}

export async function getCommunities(): Promise<CommunitiesResponse> {
  return fetchCommunities({
    requestInit: {
      next: {
        revalidate: COMMUNITY_CATALOG_REVALIDATE_SECONDS,
      },
    },
  });
}

export async function getCommunitiesFresh(): Promise<CommunitiesResponse> {
  return fetchCommunities({
    requestInit: {
      cache: 'no-store',
    },
  });
}

export async function getCommunityByRoute(
  params: CommunityRouteParams,
): Promise<ResolvedCommunityRoute | undefined> {
  const catalog = await getCommunities();
  const normalizedCountry = params.country.trim().toUpperCase();
  const normalizedSlug = params.communitySlug.trim().toLowerCase();

  const community = catalog.communities.find(
    (community) =>
      community.countryIso.toUpperCase() === normalizedCountry &&
      community.slug.toLowerCase() === normalizedSlug,
  );

  if (!community) {
    return undefined;
  }

  return {
    community,
    nameTranslationNamespace: catalog.nameTranslationNamespace,
  };
}

export async function getRequiredCommunityByRoute(
  params: CommunityRouteParams,
): Promise<ResolvedCommunityRoute> {
  const resolved = await getCommunityByRoute(params);

  if (!resolved) {
    throw new Error(
      `Community ${params.country}/${params.communitySlug} is missing from the Community catalog`,
    );
  }

  return resolved;
}
