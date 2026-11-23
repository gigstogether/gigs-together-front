const apiPublicRequestMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: apiPublicRequestMock,
}));

import { fetchCommunities } from '@/lib/community/community.api';

describe('fetchCommunities', () => {
  beforeEach(() => {
    apiPublicRequestMock.mockReset();
  });

  it('should fetch and parse the Community catalog', async () => {
    const response = {
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
    apiPublicRequestMock.mockResolvedValue(response);

    await expect(fetchCommunities()).resolves.toEqual(response);
    expect(apiPublicRequestMock).toHaveBeenCalledWith(
      '/v1/communities',
      'GET',
      undefined,
      undefined,
    );
  });

  it('should reject an invalid Community catalog response', async () => {
    apiPublicRequestMock.mockResolvedValue({ communities: [] });

    await expect(fetchCommunities()).rejects.toThrow();
  });
});
