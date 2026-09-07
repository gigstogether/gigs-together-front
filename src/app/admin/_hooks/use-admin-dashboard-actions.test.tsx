import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { act } from 'react';

import { useAdminDashboardActions } from '@/app/admin/_hooks/use-admin-dashboard-actions';
import { toast } from '@/hooks/use-toast';

const mockPostAdminDigest = vi.fn();
const mockPostAdminFeedRevalidate = vi.fn();
const mockPostAdminTranslationsRevalidate = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/app/admin/_lib/admin-api', () => ({
  postAdminDigest: () => mockPostAdminDigest(),
  postAdminFeedRevalidate: () => mockPostAdminFeedRevalidate(),
  postAdminTranslationsRevalidate: () => mockPostAdminTranslationsRevalidate(),
}));

interface HookWrapperProps {
  readonly children: ReactNode;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper(props: HookWrapperProps) {
    return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
  };
}

describe('useAdminDashboardActions', () => {
  beforeEach(() => {
    mockPostAdminDigest.mockReset();
    mockPostAdminFeedRevalidate.mockReset();
    mockPostAdminTranslationsRevalidate.mockReset();
    mockPostAdminDigest.mockResolvedValue(undefined);
    mockPostAdminFeedRevalidate.mockResolvedValue(undefined);
    mockPostAdminTranslationsRevalidate.mockResolvedValue(undefined);
    vi.mocked(toast).mockReset();
  });

  it('should call the digest post endpoint when postDigestAsync is invoked', async () => {
    const { result } = renderHook(() => useAdminDashboardActions(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.postDigestAsync();
    });

    expect(mockPostAdminDigest).toHaveBeenCalledOnce();
    expect(toast).toHaveBeenCalledWith({ title: 'Digest posted' });
  });

  it('should call feed revalidate endpoint when revalidateFeed is invoked', async () => {
    const { result } = renderHook(() => useAdminDashboardActions(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.revalidateFeed();
    });

    await waitFor(() => {
      expect(mockPostAdminFeedRevalidate).toHaveBeenCalledOnce();
    });
    expect(toast).toHaveBeenCalledWith({ title: 'Feed revalidated' });
  });

  it('should call translations revalidate endpoint when revalidateTranslations is invoked', async () => {
    const { result } = renderHook(() => useAdminDashboardActions(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.revalidateTranslations();
    });

    await waitFor(() => {
      expect(mockPostAdminTranslationsRevalidate).toHaveBeenCalledOnce();
    });
    expect(toast).toHaveBeenCalledWith({ title: 'Translations revalidated' });
  });

  it('should show a destructive toast when digest posting fails', async () => {
    mockPostAdminDigest.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useAdminDashboardActions(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.postDigestAsync()).rejects.toThrow('fail');
    });

    expect(toast).toHaveBeenCalledWith({
      title: 'Could not post digest',
      variant: 'destructive',
    });
  });

  it('should show destructive toast when feed revalidate fails', async () => {
    mockPostAdminFeedRevalidate.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useAdminDashboardActions(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.revalidateFeed();
    });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Could not revalidate feed',
        variant: 'destructive',
      });
    });
  });

  it('should show destructive toast when translations revalidate fails', async () => {
    mockPostAdminTranslationsRevalidate.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useAdminDashboardActions(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.revalidateTranslations();
    });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Could not revalidate translations',
        variant: 'destructive',
      });
    });
  });
});
