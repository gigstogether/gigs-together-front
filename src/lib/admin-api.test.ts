import {
  fetchAdminDashboard,
  fetchAdminGigs,
  fetchAdminLanguages,
  patchAdminLanguage,
  patchAdminLanguagesOrder,
} from '@/lib/admin-api';
import { GigStatus } from '@/app/admin/gigs/types';

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
          countryCode: 'ES',
          venue: 'Venue',
          suggestedBy: { userId: '42' },
          hasModerationPost: true,
        },
      ],
    });

    await expect(fetchAdminGigs({ status: GigStatus.Pending })).resolves.toEqual({
      gigs: [
        {
          publicId: 'my-gig',
          title: 'My Gig',
          status: 'Pending',
          date: '2026-06-12',
          city: 'barcelona',
          countryCode: 'ES',
          venue: 'Venue',
          suggestedBy: { userId: '42' },
          hasModerationPost: true,
        },
      ],
    });
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/gigs?status=pending', 'GET');
  });

  it('should parse published gigs when mainPostPostedAt is present', async () => {
    mockApiRequest.mockResolvedValue({
      gigs: [
        {
          publicId: 'published-gig',
          title: 'Published Gig',
          status: 'Published',
          date: '2026-06-12',
          city: 'barcelona',
          countryCode: 'ES',
          venue: 'Venue',
          suggestedBy: { userId: '42' },
          hasModerationPost: true,
          mainPostPostedAt: 1_748_784_000_000,
        },
      ],
    });

    await expect(
      fetchAdminGigs({
        status: GigStatus.Published,
        sortBy: 'post_date',
        sortOrder: 'desc',
      }),
    ).resolves.toEqual({
      gigs: [
        expect.objectContaining({
          publicId: 'published-gig',
          mainPostPostedAt: 1_748_784_000_000,
        }),
      ],
    });
  });

  it('should include sort query params when sort options are provided', async () => {
    mockApiRequest.mockResolvedValue({ gigs: [] });

    await fetchAdminGigs({
      status: GigStatus.Published,
      sortBy: 'post_date',
      sortOrder: 'desc',
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      'v1/admin/gigs?status=published&sortBy=post_date&sortOrder=desc',
      'GET',
    );
  });

  it('should throw when admin gigs response is invalid', async () => {
    mockApiRequest.mockResolvedValue({ gigs: [{}] });

    await expect(fetchAdminGigs({ status: GigStatus.Published })).rejects.toThrow(
      'Invalid admin gigs response',
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
