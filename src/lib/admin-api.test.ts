import {
  fetchAdminDashboard,
  fetchAdminGigByPublicId,
  fetchAdminGigs,
  fetchAdminLanguages,
  patchAdminLanguage,
  patchAdminLanguagesOrder,
  postAdminGigApprove,
  postAdminGigReject,
} from '@/lib/admin-api';
import { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';
import { GigStatus, GigStatusAPI } from '@/app/admin/gigs/types';

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

    const result = await fetchAdminGigs({ status: GigStatus.Pending });

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
        status: GigStatus.Approved,
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
      status: GigStatus.Approved,
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

    await expect(fetchAdminGigs({ status: GigStatus.Approved })).rejects.toThrow(
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

describe('fetchAdminLanguages', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin languages response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue([{ iso: 'en', name: 'English', isActive: true, order: 0 }]);

    await expect(fetchAdminLanguages()).resolves.toEqual([
      { iso: 'en', name: 'English', isActive: true, order: 0 },
    ]);
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/languages', 'GET');
  });

  it('should throw when admin languages response is invalid', async () => {
    mockApiRequest.mockResolvedValue([{ iso: 'en' }]);

    await expect(fetchAdminLanguages()).rejects.toThrow('Invalid admin languages response');
  });
});

describe('patchAdminLanguage', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin language patch response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      iso: 'en',
      name: 'English',
      isActive: false,
      order: 0,
    });

    await expect(patchAdminLanguage('en', { isActive: false })).resolves.toEqual({
      iso: 'en',
      name: 'English',
      isActive: false,
      order: 0,
    });
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/languages/en', 'PATCH', {
      isActive: false,
    });
  });

  it('should throw when admin language patch response includes unknown fields', async () => {
    mockApiRequest.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      iso: 'en',
      name: 'English',
      isActive: false,
      order: 0,
    });

    await expect(patchAdminLanguage('en', { isActive: false })).rejects.toThrow(
      'Invalid admin language response',
    );
  });
});

describe('patchAdminLanguagesOrder', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin languages order patch response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue([
      { iso: 'es', name: 'Español', isActive: true, order: 0 },
      { iso: 'en', name: 'English', isActive: true, order: 1 },
    ]);

    await expect(
      patchAdminLanguagesOrder([
        { iso: 'es', order: 0 },
        { iso: 'en', order: 1 },
      ]),
    ).resolves.toEqual([
      { iso: 'es', name: 'Español', isActive: true, order: 0 },
      { iso: 'en', name: 'English', isActive: true, order: 1 },
    ]);
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/languages/order', 'PATCH', {
      languages: [
        { iso: 'es', order: 0 },
        { iso: 'en', order: 1 },
      ],
    });
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
