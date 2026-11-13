import { z } from 'zod';

import {
  createAdminLocality,
  createAdminVenue,
  deleteAdminLocality,
  deleteAdminVenue,
  fetchAdminLocalities,
  fetchAdminVenues,
  updateAdminLocality,
  updateAdminVenue,
} from '@/app/admin/locations/_lib/admin-locations-api';

const apiClientRequestMock = vi.fn();

vi.mock('@/lib/api-session-client', () => ({
  apiClientRequest: (...args: unknown[]) => apiClientRequestMock(...args),
}));

describe('admin-locations-api', () => {
  beforeEach(() => {
    apiClientRequestMock.mockReset();
  });

  it('should parse localities when the API response matches the contract', async () => {
    const locality = {
      id: 'locality-1',
      countryIso: 'ES',
      name: 'Barcelona',
      qualifier: 'Barcelona province',
      aliases: ['Barna'],
      timeZone: 'Europe/Madrid',
    };
    apiClientRequestMock.mockResolvedValue({ localities: [locality] });

    await expect(fetchAdminLocalities()).resolves.toEqual([locality]);
    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/admin/localities', 'GET');
  });

  it('should reject a locality response with unknown fields', async () => {
    apiClientRequestMock.mockResolvedValue({
      localities: [
        {
          id: 'locality-1',
          countryIso: 'ES',
          name: 'Barcelona',
          aliases: [],
          timeZone: 'Europe/Madrid',
          unexpected: true,
        },
      ],
    });

    await expect(fetchAdminLocalities()).rejects.toBeInstanceOf(z.ZodError);
  });

  it('should create a locality through the versioned admin endpoint', async () => {
    const body = {
      countryIso: 'ES',
      name: 'Barcelona',
      qualifier: 'Barcelona province',
      aliases: [],
      timeZone: 'Europe/Madrid',
    };
    apiClientRequestMock.mockResolvedValue({ id: 'locality-1', ...body });

    await expect(createAdminLocality(body)).resolves.toEqual({ id: 'locality-1', ...body });
    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/admin/localities', 'POST', body);
  });

  it('should update a locality through the encoded resource endpoint', async () => {
    const body = {
      name: 'Barcelona',
      qualifier: null,
      aliases: ['Barna'],
      timeZone: 'Europe/Madrid',
    };
    apiClientRequestMock.mockResolvedValue({
      id: 'locality/1',
      countryIso: 'ES',
      name: body.name,
      aliases: body.aliases,
      timeZone: body.timeZone,
    });

    await expect(updateAdminLocality('locality/1', body)).resolves.toEqual({
      id: 'locality/1',
      countryIso: 'ES',
      name: body.name,
      aliases: body.aliases,
      timeZone: body.timeZone,
    });
    expect(apiClientRequestMock).toHaveBeenCalledWith(
      'v1/admin/localities/locality%2F1',
      'PATCH',
      body,
    );
  });

  it('should parse venues when the API response matches the contract', async () => {
    const venue = {
      id: 'venue-1',
      localityId: 'locality-1',
      name: 'Razzmatazz',
      aliases: ['Sala Razzmatazz'],
      isActive: true,
    };
    apiClientRequestMock.mockResolvedValue({ venues: [venue] });

    await expect(fetchAdminVenues()).resolves.toEqual([venue]);
    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/admin/venues', 'GET');
  });

  it('should reject a venue response with unknown fields', async () => {
    apiClientRequestMock.mockResolvedValue({
      venues: [
        {
          id: 'venue-1',
          localityId: 'locality-1',
          name: 'Razzmatazz',
          aliases: [],
          isActive: true,
          unexpected: true,
        },
      ],
    });

    await expect(fetchAdminVenues()).rejects.toBeInstanceOf(z.ZodError);
  });

  it('should create a venue through the versioned admin endpoint', async () => {
    const body = {
      localityId: 'locality-1',
      name: 'Razzmatazz',
      aliases: [],
      isActive: true,
    };
    apiClientRequestMock.mockResolvedValue({ id: 'venue-1', ...body });

    await expect(createAdminVenue(body)).resolves.toEqual({ id: 'venue-1', ...body });
    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/admin/venues', 'POST', body);
  });

  it('should update a venue through the encoded resource endpoint', async () => {
    const body = { name: 'Sala Razzmatazz', aliases: ['Razzmatazz'], isActive: false };
    apiClientRequestMock.mockResolvedValue({
      id: 'venue/1',
      localityId: 'locality-1',
      ...body,
    });

    await expect(updateAdminVenue('venue/1', body)).resolves.toEqual({
      id: 'venue/1',
      localityId: 'locality-1',
      ...body,
    });
    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/admin/venues/venue%2F1', 'PATCH', body);
  });

  it.each([
    {
      entityKind: 'locality',
      deleteEntity: deleteAdminLocality,
      endpoint: 'v1/admin/localities/locality%2F1',
    },
    {
      entityKind: 'venue',
      deleteEntity: deleteAdminVenue,
      endpoint: 'v1/admin/venues/venue%2F1',
    },
  ])(
    'should encode the $entityKind id when deleting it',
    async ({ entityKind, deleteEntity, endpoint }) => {
      apiClientRequestMock.mockResolvedValue(undefined);

      await deleteEntity(`${entityKind}/1`);

      expect(apiClientRequestMock).toHaveBeenCalledWith(endpoint, 'DELETE');
    },
  );
});
