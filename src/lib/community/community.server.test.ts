const fetchCommunitiesMock = vi.hoisted(() => vi.fn());

vi.mock('server-only', () => ({}));

vi.mock('@/lib/community/community.api', () => ({
  fetchCommunities: fetchCommunitiesMock,
}));

import {
  getCommunities,
  getCommunitiesFresh,
  getCommunityByRoute,
  getRequiredCommunityByRoute,
} from '@/lib/community/community.server';

const COMMUNITY_CATALOG = {
  nameTranslationNamespace: 'community',
  communities: [
    {
      id: 'community-id',
      countryIso: 'ES',
      slug: 'barcelona',
      nameTranslationKey: 'barcelona.name',
      timeZone: 'Europe/Madrid',
    },
  ],
};

describe('community.server', () => {
  beforeEach(() => {
    fetchCommunitiesMock.mockReset();
    fetchCommunitiesMock.mockResolvedValue(COMMUNITY_CATALOG);
  });

  it('should cache the catalog for one minute', async () => {
    await getCommunities();

    expect(fetchCommunitiesMock).toHaveBeenCalledWith({
      requestInit: { next: { revalidate: 60 } },
    });
  });

  it('should bypass the cache when a fresh catalog is requested', async () => {
    await getCommunitiesFresh();

    expect(fetchCommunitiesMock).toHaveBeenCalledWith({
      requestInit: { cache: 'no-store' },
    });
  });

  it('should resolve a Community route case-insensitively', async () => {
    await expect(
      getCommunityByRoute({ country: 'es', communitySlug: 'Barcelona' }),
    ).resolves.toEqual({
      community: COMMUNITY_CATALOG.communities[0],
      nameTranslationNamespace: 'community',
    });
  });

  it('should return undefined when a Community route does not exist', async () => {
    await expect(
      getCommunityByRoute({ country: 'ES', communitySlug: 'madrid' }),
    ).resolves.toBeUndefined();
  });

  it('should return a required Community route', async () => {
    await expect(
      getRequiredCommunityByRoute({ country: 'es', communitySlug: 'barcelona' }),
    ).resolves.toEqual({
      community: COMMUNITY_CATALOG.communities[0],
      nameTranslationNamespace: 'community',
    });
  });

  it('should reject when a required Community route is missing', async () => {
    fetchCommunitiesMock.mockResolvedValue({
      nameTranslationNamespace: 'community',
      communities: [],
    });

    await expect(
      getRequiredCommunityByRoute({ country: 'es', communitySlug: 'barcelona' }),
    ).rejects.toThrow('Community es/barcelona is missing from the Community catalog');
  });
});
