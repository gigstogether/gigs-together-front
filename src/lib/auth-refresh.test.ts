import { ApiError, ApiNetworkError } from '@/lib/api-errors';

const { fetchApiJsonMock } = vi.hoisted(() => ({
  fetchApiJsonMock: vi.fn(),
}));

vi.mock('@/lib/api-core', () => ({
  fetchApiJson: fetchApiJsonMock,
}));

import { postAuthRefresh } from '@/lib/auth-refresh';

describe('postAuthRefresh', () => {
  beforeEach(() => {
    fetchApiJsonMock.mockReset();
    fetchApiJsonMock.mockResolvedValue(undefined);
  });

  it('should resolve when the refresh request succeeds', async () => {
    await expect(postAuthRefresh()).resolves.toBeUndefined();
    expect(fetchApiJsonMock).toHaveBeenCalledWith('v1/auth/refresh', 'POST', undefined, {
      credentials: 'include',
    });
  });

  it('should propagate an unauthorized refresh response', async () => {
    const unauthorizedError = new ApiError('Unauthorized', 401);
    fetchApiJsonMock.mockRejectedValue(unauthorizedError);

    await expect(postAuthRefresh()).rejects.toBe(unauthorizedError);
  });

  it('should propagate a failed refresh response', async () => {
    const responseError = new ApiError('Service unavailable', 503);
    fetchApiJsonMock.mockRejectedValue(responseError);

    await expect(postAuthRefresh()).rejects.toBe(responseError);
  });

  it('should propagate a refresh network error', async () => {
    const networkError = new ApiNetworkError({
      method: 'POST',
      url: 'https://api.example.com/v1/auth/refresh',
      cause: new TypeError('network unavailable'),
    });
    fetchApiJsonMock.mockRejectedValue(networkError);

    await expect(postAuthRefresh()).rejects.toBe(networkError);
  });
});
