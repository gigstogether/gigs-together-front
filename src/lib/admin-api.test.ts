import { fetchAdminDashboard, fetchAdminLanguages, patchAdminLanguage } from '@/lib/admin-api';

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

describe('fetchAdminLanguages', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin languages response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      languages: [{ iso: 'en', name: 'English', isActive: true, order: 0 }],
    });

    await expect(fetchAdminLanguages()).resolves.toEqual([
      { iso: 'en', name: 'English', isActive: true, order: 0 },
    ]);
    expect(mockApiRequest).toHaveBeenCalledWith('v1/admin/languages', 'GET');
  });

  it('should throw when admin languages response is invalid', async () => {
    mockApiRequest.mockResolvedValue({ languages: [{ iso: 'en' }] });

    await expect(fetchAdminLanguages()).rejects.toThrow('Invalid admin languages response');
  });
});

describe('patchAdminLanguage', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('should parse admin language patch response when payload is valid', async () => {
    mockApiRequest.mockResolvedValue({
      language: { iso: 'en', name: 'English', isActive: false, order: 0 },
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
      language: {
        _id: '507f1f77bcf86cd799439011',
        iso: 'en',
        name: 'English',
        isActive: false,
        order: 0,
      },
    });

    await expect(patchAdminLanguage('en', { isActive: false })).rejects.toThrow(
      'Invalid admin language response',
    );
  });
});
