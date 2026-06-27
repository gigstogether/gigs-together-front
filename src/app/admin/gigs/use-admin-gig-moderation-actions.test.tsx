import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { act } from 'react';

import { useAdminGigModerationActions } from '@/app/admin/gigs/use-admin-gig-moderation-actions';

const mockPostAdminGigApprove = vi.fn();
const mockPostAdminGigReject = vi.fn();
const mockPostAdminGigPost = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/lib/admin-api', () => ({
  postAdminGigApprove: (publicId: string) => mockPostAdminGigApprove(publicId),
  postAdminGigReject: (publicId: string) => mockPostAdminGigReject(publicId),
  postAdminGigPost: (publicId: string) => mockPostAdminGigPost(publicId),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper(props: { readonly children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
  };
}

describe('useAdminGigModerationActions', () => {
  beforeEach(() => {
    mockPostAdminGigApprove.mockReset();
    mockPostAdminGigReject.mockReset();
    mockPostAdminGigPost.mockReset();
    mockPostAdminGigApprove.mockResolvedValue(undefined);
    mockPostAdminGigReject.mockResolvedValue(undefined);
    mockPostAdminGigPost.mockResolvedValue(undefined);
  });

  it('should call approve endpoint when approve is invoked', async () => {
    const { result } = renderHook(
      () => useAdminGigModerationActions({ publicId: 'radiohead-barcelona' }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.approve();
    });

    await waitFor(() => {
      expect(mockPostAdminGigApprove).toHaveBeenCalledWith('radiohead-barcelona');
    });
  });

  it('should call reject endpoint when reject is invoked', async () => {
    const { result } = renderHook(
      () => useAdminGigModerationActions({ publicId: 'radiohead-barcelona' }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.reject();
    });

    await waitFor(() => {
      expect(mockPostAdminGigReject).toHaveBeenCalledWith('radiohead-barcelona');
    });
  });

  it('should call post endpoint when post is invoked', async () => {
    const { result } = renderHook(
      () => useAdminGigModerationActions({ publicId: 'radiohead-barcelona' }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.post();
    });

    await waitFor(() => {
      expect(mockPostAdminGigPost).toHaveBeenCalledWith('radiohead-barcelona');
    });
  });
});
