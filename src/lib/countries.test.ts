import { z } from 'zod';

import { fetchCountries } from '@/lib/countries';

const apiPublicRequestMock = vi.fn();

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: (...args: unknown[]) => apiPublicRequestMock(...args),
}));

describe('fetchCountries', () => {
  beforeEach(() => {
    apiPublicRequestMock.mockReset();
  });

  it('should return country references from the public endpoint', async () => {
    apiPublicRequestMock.mockResolvedValue([{ iso: 'AD' }, { iso: 'FR' }]);

    await expect(fetchCountries()).resolves.toEqual([{ iso: 'AD' }, { iso: 'FR' }]);
    expect(apiPublicRequestMock).toHaveBeenCalledWith('/v1/countries', 'GET', undefined, undefined);
  });

  it('should forward server cache options to the public endpoint', async () => {
    apiPublicRequestMock.mockResolvedValue([{ iso: 'ES' }]);

    await fetchCountries({ cache: 'force-cache' });

    expect(apiPublicRequestMock).toHaveBeenCalledWith('/v1/countries', 'GET', undefined, {
      cache: 'force-cache',
    });
  });

  it('should reject an invalid country reference response', async () => {
    apiPublicRequestMock.mockResolvedValue([{ iso: 'ESP' }]);

    await expect(fetchCountries()).rejects.toBeInstanceOf(z.ZodError);
  });
});
