// @vitest-environment jsdom

import { ApiError, ApiNetworkError } from '@/lib/api-errors';

const { fetchApiJsonMock } = vi.hoisted(() => ({
  fetchApiJsonMock: vi.fn(),
}));

vi.mock('@/lib/api-core', () => ({
  fetchApiJson: fetchApiJsonMock,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    telegramClientProfileStorageKey: 'gt_test_profile',
  },
}));

import { postAuthRefresh } from '@/lib/auth-refresh';

describe('postAuthRefresh', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchApiJsonMock.mockReset();
    fetchApiJsonMock.mockResolvedValue({
      profile: {
        displayLabel: '@user',
        isAdmin: false,
      },
    });
  });

  it('should resolve when the refresh request succeeds', async () => {
    await expect(postAuthRefresh()).resolves.toBeUndefined();
    expect(fetchApiJsonMock).toHaveBeenCalledWith('v1/auth/refresh', 'POST', undefined, {
      credentials: 'include',
    });
  });

  it('should replace the stored client profile when refresh returns updated admin access', async () => {
    localStorage.setItem(
      'gt_test_profile',
      JSON.stringify({ displayLabel: '@user', isAdmin: false }),
    );
    fetchApiJsonMock.mockResolvedValue({
      profile: {
        displayLabel: '@user',
        isAdmin: true,
      },
    });

    await postAuthRefresh();

    expect(localStorage.getItem('gt_test_profile')).toBe(
      JSON.stringify({ displayLabel: '@user', isAdmin: true }),
    );
  });

  it('should reject an invalid refreshed profile without replacing the stored profile', async () => {
    const storedProfile = JSON.stringify({ displayLabel: '@user', isAdmin: false });
    localStorage.setItem('gt_test_profile', storedProfile);
    fetchApiJsonMock.mockResolvedValue({
      profile: {
        displayLabel: '@user',
        isAdmin: 'yes',
      },
    });

    await expect(postAuthRefresh()).rejects.toThrow(
      'Invalid auth client profile response: profile.isAdmin',
    );
    expect(localStorage.getItem('gt_test_profile')).toBe(storedProfile);
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
