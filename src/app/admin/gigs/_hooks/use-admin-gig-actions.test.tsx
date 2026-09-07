// @vitest-environment jsdom

import { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react';

import type { patchAdminGigVisibility, postAdminGigMainPost } from '@/app/admin/_lib/admin-api';
import { useAdminGigActions } from '@/app/admin/gigs/_hooks/use-admin-gig-actions';
import { toast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-errors';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { patchAdminGigVisibilityMock, postAdminGigMainPostMock } = vi.hoisted(() => ({
  patchAdminGigVisibilityMock: vi.fn<typeof patchAdminGigVisibility>(),
  postAdminGigMainPostMock: vi.fn<typeof postAdminGigMainPost>(),
}));

vi.mock('@/app/admin/_lib/admin-api', () => ({
  patchAdminGigVisibility: patchAdminGigVisibilityMock,
  postAdminGigMainPost: postAdminGigMainPostMock,
}));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));

function renderActions() {
  const queryClient = createTestQueryClient();
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  const hook = renderHook(
    () =>
      useAdminGigActions({
        publicId: 'gig-2026-09-17',
        expectedVersion: 7,
        isVisible: true,
      }),
    { wrapper: createQueryClientWrapper(queryClient) },
  );
  return { ...hook, invalidateQueries };
}

describe('useAdminGigActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send the loaded Gig version when changing visibility', async () => {
    patchAdminGigVisibilityMock.mockResolvedValueOnce({
      publicId: 'gig-2026-09-17',
      version: 8,
      isVisible: false,
    });
    const { result } = renderActions();

    act(() => result.current.toggleVisibility());

    await waitFor(() => {
      expect(patchAdminGigVisibilityMock).toHaveBeenCalledWith({
        publicId: 'gig-2026-09-17',
        expectedVersion: 7,
        isVisible: false,
      });
    });
  });

  it('should refresh Gig data and explain a stale version conflict', async () => {
    postAdminGigMainPostMock.mockRejectedValueOnce(new ApiError('Conflict', 409));
    const { result, invalidateQueries } = renderActions();

    act(() => result.current.post());

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Gig changed',
        description: 'The latest version was loaded. Please try again.',
        variant: 'destructive',
      });
    });
    expect(invalidateQueries).toHaveBeenCalledTimes(3);
  });
});
