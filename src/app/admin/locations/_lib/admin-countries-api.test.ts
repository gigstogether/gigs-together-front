import { z } from 'zod';

import {
  createAdminCountry,
  fetchAdminCountries,
  fetchAdminCountryOptions,
} from '@/app/admin/locations/_lib/admin-countries-api';

const apiClientRequestMock = vi.fn();

vi.mock('@/lib/api-session-client', () => ({
  apiClientRequest: (...args: unknown[]) => apiClientRequestMock(...args),
}));

describe('admin-countries-api', () => {
  beforeEach(() => {
    apiClientRequestMock.mockReset();
  });

  it('should parse configured countries', async () => {
    apiClientRequestMock.mockResolvedValue({ countries: [{ iso: 'ES' }] });

    await expect(fetchAdminCountries()).resolves.toEqual([{ iso: 'ES' }]);
    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/admin/countries', 'GET');
  });

  it('should parse country options with configuration state', async () => {
    apiClientRequestMock.mockResolvedValue({
      countries: [{ iso: 'ES', isConfigured: true }],
    });

    await expect(fetchAdminCountryOptions()).resolves.toEqual([{ iso: 'ES', isConfigured: true }]);
  });

  it('should reject an invalid country options response', async () => {
    apiClientRequestMock.mockResolvedValue({
      countries: [{ iso: 'ESP', isConfigured: true }],
    });

    await expect(fetchAdminCountryOptions()).rejects.toBeInstanceOf(z.ZodError);
  });

  it('should send a country create body', async () => {
    apiClientRequestMock.mockResolvedValue({ iso: 'FR' });

    await expect(createAdminCountry({ iso: 'FR' })).resolves.toEqual({ iso: 'FR' });
    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/admin/countries', 'POST', {
      iso: 'FR',
    });
  });
});
