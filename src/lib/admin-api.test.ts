import {
  fetchAdminDashboard,
  fetchAdminGigByPublicId,
  fetchAdminGigs,
  fetchAdminLocales,
  fetchAdminTranslationNamespaces,
  fetchAdminTranslations,
  patchAdminLocale,
  patchAdminLocalesOrder,
  patchAdminTranslationActive,
  postAdminGigApprove,
  postAdminGigPost,
  postAdminGigReject,
  putAdminTranslation,
  isAdminTranslationKind,
} from '@/lib/admin-api';
import { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';
import { GigStatusAPI, GigStatusFilter } from '@/app/admin/gigs/types';

const mockApiRequest = vi.fn();

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

describe('fetchAdminDashboard', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin dashboard response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      summary: {
        pendingGigsCount: 2,
        publishedGigsCount: 10,
      },
    });

    await expect(fetchAdminDashboard()).resolves.toEqual({
      summary: {
        pendingGigsCount: 2,
        publishedGigsCount: 10,
      },
    });
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/dashboard', 'GET');
  });

  it('should throw when admin dashboard response is invalid', async () => {
    mockApiRequest.mockResolvedValue({ summary: {} });

    await expect(fetchAdminDashboard()).rejects.toThrow('Invalid admin dashboard response');
  });
});

describe('fetchAdminGigs', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin gigs response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      gigs: [
        {
          publicId: 'my-gig',
          title: 'My Gig',
          status: 'Pending',
          date: '2026-06-12',
          city: 'barcelona',
          country: 'ES',
          venue: 'Venue',
          suggestedBy: { userId: '42' },
        },
      ],
    });

    const result = await fetchAdminGigs({ status: GigStatusFilter.Pending });

    expect(result).toEqual({
      gigs: [
        {
          publicId: 'my-gig',
          title: 'My Gig',
          status: 'Pending',
          date: '2026-06-12',
          city: 'barcelona',
          country: 'ES',
          venue: 'Venue',
          suggestedBy: { userId: '42' },
        },
      ],
    });
    expect(result.gigs[0]?.status).toBe(GigStatusAPI.Pending);
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/gigs?status=pending', 'GET');
  });

  it('should parse post dates when publishPostDate and moderationPostDate are present', async () => {
    mockApiRequest.mockResolvedValue({
      gigs: [
        {
          publicId: 'published-gig',
          title: 'Published Gig',
          status: 'Published',
          date: '2026-06-12',
          city: 'barcelona',
          country: 'ES',
          venue: 'Venue',
          suggestedBy: { userId: '42' },
          publishPostDate: 1_748_784_000_000,
          moderationPostDate: 1_748_697_600_000,
        },
      ],
    });

    await expect(
      fetchAdminGigs({
        status: GigStatusFilter.Approved,
        sortBy: AdminGigsSortBy.CreatedAt,
        sortOrder: AdminGigsSortOrder.Desc,
      }),
    ).resolves.toEqual({
      gigs: [
        expect.objectContaining({
          publicId: 'published-gig',
          publishPostDate: 1_748_784_000_000,
          moderationPostDate: 1_748_697_600_000,
        }),
      ],
    });
  });

  it('should include sort query params when sort options are provided', async () => {
    mockApiRequest.mockResolvedValue({ gigs: [] });

    await fetchAdminGigs({
      status: GigStatusFilter.Approved,
      sortBy: AdminGigsSortBy.EventDate,
      sortOrder: AdminGigsSortOrder.Desc,
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      'v1/admin/gigs?status=approved&sortBy=eventDate&sortOrder=desc',
      'GET',
    );
  });

  it('should throw when admin gigs response is invalid', async () => {
    mockApiRequest.mockResolvedValue({ gigs: [{}] });

    await expect(fetchAdminGigs({ status: GigStatusFilter.Approved })).rejects.toThrow(
      'Invalid admin gigs response',
    );
  });
});

describe('fetchAdminGigByPublicId', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin gig form data when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      publicId: 'radiohead-barcelona-2026-06-12',
      title: 'Radiohead',
      status: 'Pending',
      date: '2026-06-12',
      city: 'barcelona',
      country: 'ES',
      venue: 'Palau Sant Jordi',
      ticketsUrl: 'https://example.com/tickets',
      suggestedBy: { userId: '9001' },
      publishPostUrl: 'https://t.me/channel/1',
      moderationPostDate: 1_748_697_600_000,
    });

    const result = await fetchAdminGigByPublicId({ publicId: 'radiohead-barcelona-2026-06-12' });

    expect(result).toEqual({
      publicId: 'radiohead-barcelona-2026-06-12',
      title: 'Radiohead',
      status: 'Pending',
      date: '2026-06-12',
      city: 'barcelona',
      country: 'ES',
      venue: 'Palau Sant Jordi',
      ticketsUrl: 'https://example.com/tickets',
      suggestedBy: { userId: '9001' },
      publishPostUrl: 'https://t.me/channel/1',
      moderationPostDate: 1_748_697_600_000,
    });
    expect(result.status).toBe(GigStatusAPI.Pending);
    expect(mockApiRequest).toHaveBeenCalledWith(
      'v1/admin/gig/radiohead-barcelona-2026-06-12',
      'GET',
      undefined,
      { signal: undefined },
    );
  });

  it('should throw when admin gig response is invalid', async () => {
    mockApiRequest.mockResolvedValue({ publicId: 'gig-42' });

    await expect(fetchAdminGigByPublicId({ publicId: 'gig-42' })).rejects.toThrow(
      'Invalid admin gig response',
    );
  });
});

describe('fetchAdminLocales', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin locales response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue([
      { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
    ]);

    await expect(fetchAdminLocales()).resolves.toEqual([
      { iso: 'en', nativeName: 'English', isActive: true, order: 0 },
    ]);
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/locales', 'GET');
  });

  it('should throw when admin locales response uses legacy name field', async () => {
    mockApiRequest.mockResolvedValue([{ iso: 'en', name: 'English', isActive: true, order: 0 }]);

    await expect(fetchAdminLocales()).rejects.toThrow('Invalid admin locales response');
  });

  it('should throw when admin locales response is invalid', async () => {
    mockApiRequest.mockResolvedValue([{ iso: 'en' }]);

    await expect(fetchAdminLocales()).rejects.toThrow('Invalid admin locales response');
  });
});

describe('patchAdminLocale', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin locale patch response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      iso: 'en',
      nativeName: 'English',
      isActive: false,
      order: 0,
    });

    await expect(patchAdminLocale('en', { isActive: false })).resolves.toEqual({
      iso: 'en',
      nativeName: 'English',
      isActive: false,
      order: 0,
    });
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/locales/en', 'PATCH', {
      isActive: false,
    });
  });

  it('should throw when admin locale patch response includes unknown fields', async () => {
    mockApiRequest.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      iso: 'en',
      nativeName: 'English',
      isActive: false,
      order: 0,
    });

    await expect(patchAdminLocale('en', { isActive: false })).rejects.toThrow(
      'Invalid admin locale response',
    );
  });
});

describe('patchAdminLocalesOrder', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin locales order patch response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue([
      { iso: 'es', nativeName: 'Español', isActive: true, order: 0 },
      { iso: 'en', nativeName: 'English', isActive: true, order: 1 },
    ]);

    await expect(
      patchAdminLocalesOrder([
        { iso: 'es', order: 0 },
        { iso: 'en', order: 1 },
      ]),
    ).resolves.toEqual([
      { iso: 'es', nativeName: 'Español', isActive: true, order: 0 },
      { iso: 'en', nativeName: 'English', isActive: true, order: 1 },
    ]);
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/locales/order', 'PATCH', {
      locales: [
        { iso: 'es', order: 0 },
        { iso: 'en', order: 1 },
      ],
    });
  });
});

describe('fetchAdminTranslationNamespaces', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin translation namespaces response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      namespaces: ['about', 'country'],
    });

    await expect(fetchAdminTranslationNamespaces()).resolves.toEqual(['about', 'country']);
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/translations/namespaces', 'GET');
  });
});

describe('fetchAdminTranslations', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin translations response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      records: [
        {
          id: '64f1a2b3c4d5e6f7a8b9c0d1',
          namespace: 'about',
          locale: 'en',
          key: 'title',
          value: 'About',
          format: 'plain',
          kind: 'text',
          isActive: true,
        },
      ],
    });

    await expect(fetchAdminTranslations({ namespace: 'about', locale: 'en' })).resolves.toEqual([
      {
        id: '64f1a2b3c4d5e6f7a8b9c0d1',
        namespace: 'about',
        locale: 'en',
        key: 'title',
        value: 'About',
        format: 'plain',
        kind: 'text',
        isActive: true,
      },
    ]);
    expect(mockApiRequest).toHaveBeenCalledWith(
      'v1/admin/translations?namespace=about&locale=en',
      'GET',
    );
  });

  it('should request all locales for namespace when locale is omitted', async () => {
    mockApiRequest.mockResolvedValue({ records: [] });

    await expect(fetchAdminTranslations({ namespace: 'about' })).resolves.toEqual([]);
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/translations?namespace=about', 'GET');
  });

  it('should request all namespaces when namespace is omitted', async () => {
    mockApiRequest.mockResolvedValue({ records: [] });

    await expect(fetchAdminTranslations({})).resolves.toEqual([]);
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/translations', 'GET');
  });

  it('should throw when admin translations response is invalid', async () => {
    mockApiRequest.mockResolvedValue({ records: [{}] });

    await expect(fetchAdminTranslations({ namespace: 'about' })).rejects.toThrow(
      'Invalid admin translations response',
    );
  });

  it('should parse country translation records with lowercase iso keys', async () => {
    mockApiRequest.mockResolvedValue({
      records: [
        {
          id: '64f1a2b3c4d5e6f7a8b9c0d2',
          namespace: 'country',
          locale: 'en',
          key: 'es',
          value: 'Spain',
          format: 'plain',
          kind: 'text',
          isActive: true,
        },
      ],
    });

    await expect(fetchAdminTranslations({ namespace: 'country' })).resolves.toEqual([
      {
        id: '64f1a2b3c4d5e6f7a8b9c0d2',
        namespace: 'country',
        locale: 'en',
        key: 'es',
        value: 'Spain',
        format: 'plain',
        kind: 'text',
        isActive: true,
      },
    ]);
  });

  it('should throw when required translation fields are missing', async () => {
    mockApiRequest.mockResolvedValue({
      records: [
        {
          id: '64f1a2b3c4d5e6f7a8b9c0d3',
          namespace: 'city',
          locale: 'en',
          key: 'barcelona',
          value: 'Barcelona',
        },
      ],
    });

    await expect(fetchAdminTranslations({ namespace: 'city' })).rejects.toThrow(
      'Invalid admin translations response',
    );
  });

  it('should ignore extra translation record fields from the API', async () => {
    mockApiRequest.mockResolvedValue({
      records: [
        {
          id: '64f1a2b3c4d5e6f7a8b9c0d1',
          namespace: 'about',
          locale: 'en',
          key: 'title',
          value: 'About',
          format: 'plain',
          kind: 'text',
          isActive: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
    });

    await expect(fetchAdminTranslations({ namespace: 'about' })).resolves.toEqual([
      {
        id: '64f1a2b3c4d5e6f7a8b9c0d1',
        namespace: 'about',
        locale: 'en',
        key: 'title',
        value: 'About',
        format: 'plain',
        kind: 'text',
        isActive: true,
      },
    ]);
  });

  it('should throw when locale translations payload is received instead of admin payload', async () => {
    mockApiRequest.mockResolvedValue({
      locale: 'en',
      translations: {
        country: {
          es: {
            value: 'Spain',
            format: 'plain',
            kind: 'text',
          },
        },
      },
    });

    await expect(fetchAdminTranslations({ namespace: 'country' })).rejects.toThrow(
      'received locale translations payload',
    );
  });
});

describe('putAdminTranslation', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin translation upsert response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      id: '64f1a2b3c4d5e6f7a8b9c0d1',
      namespace: 'about',
      locale: 'en',
      key: 'title',
      value: 'About us',
      format: 'plain',
      kind: 'text',
      isActive: true,
    });

    await expect(
      putAdminTranslation({
        namespace: 'about',
        locale: 'en',
        key: 'title',
        value: 'About us',
        format: 'plain',
        kind: 'text',
        isActive: true,
      }),
    ).resolves.toEqual({
      id: '64f1a2b3c4d5e6f7a8b9c0d1',
      namespace: 'about',
      locale: 'en',
      key: 'title',
      value: 'About us',
      format: 'plain',
      kind: 'text',
      isActive: true,
    });
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/translations', 'PUT', {
      namespace: 'about',
      locale: 'en',
      key: 'title',
      value: 'About us',
      format: 'plain',
      kind: 'text',
      isActive: true,
    });
  });
});

describe('patchAdminTranslationActive', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin translation active patch response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      id: '64f1a2b3c4d5e6f7a8b9c0d1',
      namespace: 'about',
      locale: 'en',
      key: 'title',
      value: 'About',
      format: 'plain',
      kind: 'text',
      isActive: false,
    });

    await expect(
      patchAdminTranslationActive('64f1a2b3c4d5e6f7a8b9c0d1', { isActive: false }),
    ).resolves.toEqual({
      id: '64f1a2b3c4d5e6f7a8b9c0d1',
      namespace: 'about',
      locale: 'en',
      key: 'title',
      value: 'About',
      format: 'plain',
      kind: 'text',
      isActive: false,
    });
    expect(mockApiRequest).toHaveBeenCalledWith(
      'v1/admin/translations/64f1a2b3c4d5e6f7a8b9c0d1/active',
      'PATCH',
      { isActive: false },
    );
  });
});

describe('isAdminTranslationKind', () => {
  it('should return true for supported translation kinds', () => {
    expect(isAdminTranslationKind('text')).toBe(true);
    expect(isAdminTranslationKind('template')).toBe(true);
  });

  it('should return false for unsupported translation kinds', () => {
    expect(isAdminTranslationKind('html')).toBe(false);
  });
});

describe('postAdminGigApprove', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should post approve request when response succeeds', async () => {
    mockApiRequest.mockResolvedValue(undefined);

    await expect(postAdminGigApprove('radiohead-barcelona-2026-06-12')).resolves.toBeUndefined();
    expect(mockApiRequest).toHaveBeenCalledWith(
      'v1/admin/gig/radiohead-barcelona-2026-06-12/approve',
      'POST',
    );
  });
});

describe('postAdminGigReject', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should post reject request when response succeeds', async () => {
    mockApiRequest.mockResolvedValue(undefined);

    await expect(postAdminGigReject('radiohead-barcelona-2026-06-12')).resolves.toBeUndefined();
    expect(mockApiRequest).toHaveBeenCalledWith(
      'v1/admin/gig/radiohead-barcelona-2026-06-12/reject',
      'POST',
    );
  });
});

describe('postAdminGigPost', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should post publish request when response succeeds', async () => {
    mockApiRequest.mockResolvedValue(undefined);

    await expect(postAdminGigPost('radiohead-barcelona-2026-06-12')).resolves.toBeUndefined();
    expect(mockApiRequest).toHaveBeenCalledWith(
      'v1/admin/gig/radiohead-barcelona-2026-06-12/post',
      'POST',
    );
  });
});
