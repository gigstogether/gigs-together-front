import { fetchAdminDashboard } from '@/lib/admin-api';

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
