import { ApiError } from '@/lib/api-errors';
import {
  bootstrapMiniAppSessionAndRefreshMe,
  clearAuthMeProfileCache,
  fetchAuthMeProfile,
  invalidateAuthMeQuery,
  prefetchAuthMeProfile,
  registerAuthMeQueryClient,
  setAuthMeProfileQueryData,
} from '@/lib/auth-me';
import { authKeys } from '@/lib/auth-keys';
import { createTestQueryClient } from '@/test-utils/react-query-client';

const mockFetchApiJson = vi.fn();
const mockBootstrapTelegramAuthFromWebApp = vi.fn();

vi.mock('@/lib/api-core', () => ({
  fetchApiJson: (...args: unknown[]) => mockFetchApiJson(...args),
}));

vi.mock('@/lib/telegram-auth', () => ({
  bootstrapTelegramAuthFromWebApp: () => mockBootstrapTelegramAuthFromWebApp(),
}));

describe('fetchAuthMeProfile', () => {
  beforeEach(() => {
    mockFetchApiJson.mockReset();
  });

  it('should return profile when me succeeds', async () => {
    mockFetchApiJson.mockResolvedValue({
      profile: {
        displayLabel: '@admin',
        photoUrl: 'https://example.com/a.jpg',
        isAdmin: true,
      },
    });

    const profile = await fetchAuthMeProfile();

    expect(profile).toEqual({
      displayLabel: '@admin',
      photoUrl: 'https://example.com/a.jpg',
      isAdmin: true,
    });
    expect(mockFetchApiJson).toHaveBeenCalledWith('v1/auth/me', 'GET', undefined, {
      credentials: 'include',
    });
  });

  it('should return null when me responds with 401', async () => {
    mockFetchApiJson.mockRejectedValue(new ApiError('Unauthorized', 401));

    const profile = await fetchAuthMeProfile();

    expect(profile).toBeNull();
  });

  it('should rethrow when me fails with a non-401 error', async () => {
    mockFetchApiJson.mockRejectedValue(new ApiError('Server error', 500));

    await expect(fetchAuthMeProfile()).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});

describe('registerAuthMeQueryClient', () => {
  it('should clear auth me cache when clearAuthMeProfileCache runs after register', () => {
    const queryClient = createTestQueryClient();
    setAuthMeProfileQueryData(queryClient, { displayLabel: '@user', isAdmin: false });
    registerAuthMeQueryClient(queryClient);

    clearAuthMeProfileCache();

    expect(queryClient.getQueryData(authKeys.me())).toBeNull();
  });

  it('should no-op clearAuthMeProfileCache when query client is not registered', () => {
    const queryClient = createTestQueryClient();
    setAuthMeProfileQueryData(queryClient, { displayLabel: '@user', isAdmin: false });

    clearAuthMeProfileCache();

    expect(queryClient.getQueryData(authKeys.me())).toEqual({
      displayLabel: '@user',
      isAdmin: false,
    });
  });
});

describe('prefetchAuthMeProfile', () => {
  it('should prefetch auth me query', async () => {
    mockFetchApiJson.mockResolvedValue({
      profile: { displayLabel: '@user', isAdmin: false },
    });

    const queryClient = createTestQueryClient();
    await prefetchAuthMeProfile(queryClient);

    expect(queryClient.getQueryData(authKeys.me())).toEqual({
      displayLabel: '@user',
      isAdmin: false,
    });
  });
});

describe('setAuthMeProfileQueryData', () => {
  it('should set auth me cache entry', () => {
    const queryClient = createTestQueryClient();
    setAuthMeProfileQueryData(queryClient, { displayLabel: '@ada', isAdmin: true });

    expect(queryClient.getQueryData(authKeys.me())).toEqual({
      displayLabel: '@ada',
      isAdmin: true,
    });
  });
});

describe('bootstrapMiniAppSessionAndRefreshMe', () => {
  beforeEach(() => {
    mockBootstrapTelegramAuthFromWebApp.mockReset();
  });

  it('should invalidate auth me when mini app bootstrap succeeds', async () => {
    mockBootstrapTelegramAuthFromWebApp.mockResolvedValue(true);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await bootstrapMiniAppSessionAndRefreshMe(queryClient);

    expect(mockBootstrapTelegramAuthFromWebApp).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: authKeys.me() });
  });

  it('should skip invalidate when mini app bootstrap does not run', async () => {
    mockBootstrapTelegramAuthFromWebApp.mockResolvedValue(false);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await bootstrapMiniAppSessionAndRefreshMe(queryClient);

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe('invalidateAuthMeQuery', () => {
  it('should invalidate auth me query key', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateAuthMeQuery(queryClient);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: authKeys.me() });
  });
});
