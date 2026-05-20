// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';

import { useMe } from '@/hooks/use-me';
import { createQueryClientWrapper, createTestQueryClient } from '@/test-utils/react-query-client';

const mockFetchAuthMeProfile = vi.fn();

vi.mock('@/lib/auth-me', () => ({
  fetchAuthMeProfile: () => mockFetchAuthMeProfile(),
  prefetchAuthMeProfile: vi.fn(),
  setAuthMeProfileQueryData: vi.fn(),
  invalidateAuthMeQuery: vi.fn(),
  bootstrapMiniAppSessionAndRefreshMe: vi.fn(),
}));

describe('useMe', () => {
  beforeEach(() => {
    mockFetchAuthMeProfile.mockReset();
  });

  it('should resolve profile from auth me', async () => {
    mockFetchAuthMeProfile.mockResolvedValue({
      displayLabel: '@user',
      isAdmin: true,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMe(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      displayLabel: '@user',
      isAdmin: true,
    });
  });

  it('should resolve null when user is unauthenticated', async () => {
    mockFetchAuthMeProfile.mockResolvedValue(null);

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMe(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });
});
