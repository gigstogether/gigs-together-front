import { z } from 'zod';

import {
  createAdminLocality,
  createAdminPlace,
  deleteAdminLocality,
  deleteAdminPlace,
  fetchAdminLocalities,
  fetchAdminPlaces,
  updateAdminLocality,
  updateAdminPlace,
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

  it('should parse places when the API response matches the contract', async () => {
    const place = {
      id: 'place-1',
      localityId: 'locality-1',
      name: 'Razzmatazz',
      aliases: ['Sala Razzmatazz'],
      isActive: true,
    };
    apiClientRequestMock.mockResolvedValue({ places: [place] });

    await expect(fetchAdminPlaces()).resolves.toEqual([place]);
    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/admin/places', 'GET');
  });

  it('should reject a place response with unknown fields', async () => {
    apiClientRequestMock.mockResolvedValue({
      places: [
        {
          id: 'place-1',
          localityId: 'locality-1',
          name: 'Razzmatazz',
          aliases: [],
          isActive: true,
          unexpected: true,
        },
      ],
    });

    await expect(fetchAdminPlaces()).rejects.toBeInstanceOf(z.ZodError);
  });

  it('should create a place through the versioned admin endpoint', async () => {
    const body = {
      localityId: 'locality-1',
      name: 'Razzmatazz',
      aliases: [],
      isActive: true,
    };
    apiClientRequestMock.mockResolvedValue({ id: 'place-1', ...body });

    await expect(createAdminPlace(body)).resolves.toEqual({ id: 'place-1', ...body });
    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/admin/places', 'POST', body);
  });

  it('should update a place through the encoded resource endpoint', async () => {
    const body = { name: 'Sala Razzmatazz', aliases: ['Razzmatazz'], isActive: false };
    apiClientRequestMock.mockResolvedValue({
      id: 'place/1',
      localityId: 'locality-1',
      ...body,
    });

    await expect(updateAdminPlace('place/1', body)).resolves.toEqual({
      id: 'place/1',
      localityId: 'locality-1',
      ...body,
    });
    expect(apiClientRequestMock).toHaveBeenCalledWith('v1/admin/places/place%2F1', 'PATCH', body);
  });

  it.each([
    {
      entityKind: 'locality',
      deleteEntity: deleteAdminLocality,
      endpoint: 'v1/admin/localities/locality%2F1',
    },
    {
      entityKind: 'place',
      deleteEntity: deleteAdminPlace,
      endpoint: 'v1/admin/places/place%2F1',
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
