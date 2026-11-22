import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiPublicRequestMock } = vi.hoisted(() => ({
  apiPublicRequestMock: vi.fn(),
}));

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: apiPublicRequestMock,
}));

import {
  fetchPublicLocalities,
  fetchPublicVenues,
  formatLocalityName,
} from './location-catalog-api';

const LOCALITY = {
  id: 'locality-id',
  countryIso: 'ES',
  name: 'Barcelona',
  qualifier: 'Catalonia',
  timeZone: 'Europe/Madrid',
};

describe('locationCatalogApi', () => {
  beforeEach(() => {
    apiPublicRequestMock.mockReset();
  });

  it('should fetch Localities for the selected Country', async () => {
    apiPublicRequestMock.mockResolvedValue({ localities: [LOCALITY] });

    await expect(fetchPublicLocalities('ES')).resolves.toEqual({
      localities: [LOCALITY],
    });
    expect(apiPublicRequestMock).toHaveBeenCalledWith('/v1/localities?countryIso=ES', 'GET');
  });

  it('should reject an invalid Locality response', async () => {
    apiPublicRequestMock.mockResolvedValue({ localities: [{ id: '' }] });

    await expect(fetchPublicLocalities('ES')).rejects.toThrow();
  });

  it('should fetch active Venues for the selected Locality', async () => {
    apiPublicRequestMock.mockResolvedValue({
      locality: LOCALITY,
      venues: [{ id: 'venue-id', name: 'Razzmatazz' }],
    });

    await expect(fetchPublicVenues('locality-id')).resolves.toEqual({
      locality: LOCALITY,
      venues: [{ id: 'venue-id', name: 'Razzmatazz' }],
    });
    expect(apiPublicRequestMock).toHaveBeenCalledWith('/v1/venues?localityId=locality-id', 'GET');
  });

  it('should include the qualifier in a Locality display name', () => {
    expect(formatLocalityName(LOCALITY)).toBe('Barcelona (Catalonia)');
  });
});
