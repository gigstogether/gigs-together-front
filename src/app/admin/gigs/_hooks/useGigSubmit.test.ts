// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';

import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import type { GigUpsertApiParams, GigUpsertResponse } from '@/app/admin/gigs/_lib/gig-form-api';
import { feedKeys } from '@/lib/feed/feedKeys';
import { gigFormKeys } from '@/app/admin/gigs/_lib/gigFormKeys';
import { defaultGigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import { useGigSubmit } from '@/app/admin/gigs/_hooks/useGigSubmit';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { toastMock } = vi.hoisted(() => ({
  toastMock: vi.fn(),
}));

const { toastTelegramInitDataExpiredMock } = vi.hoisted(() => ({
  toastTelegramInitDataExpiredMock: vi.fn(() => false),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: toastMock,
}));

vi.mock('@/app/admin/gigs/_lib/telegram-init-data-expired', () => ({
  toastTelegramInitDataExpired: toastTelegramInitDataExpiredMock,
}));

const DEFAULT_SUBMIT_VALUES: GigFormValues = {
  ...defaultGigFormValues,
  title: 'Arctic Monkeys',
  date: '2026-07-01',
  city: 'Barcelona',
  country: 'ES',
  venue: 'Razzmatazz',
  ticketsUrl: 'https://tickets.example/gig',
};

describe('useGigSubmit', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should call submit API and invalidate feed and gig-form queries when submission succeeds', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const apiCall = vi
      .fn<(params: GigUpsertApiParams) => Promise<GigUpsertResponse>>()
      .mockResolvedValueOnce({ publicId: 'arctic-monkeys-2026-07-01' });
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useGigSubmit({
          posterFile: null,
          posterUrl: 'https://images.example/poster.png',
          apiCall,
          onSuccess,
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.onSubmit(DEFAULT_SUBMIT_VALUES);
    });

    expect(apiCall).toHaveBeenCalledWith({
      gig: {
        title: 'Arctic Monkeys',
        date: '2026-07-01',
        endDate: undefined,
        city: 'Barcelona',
        country: 'ES',
        venue: 'Razzmatazz',
        ticketsUrl: 'https://tickets.example/gig',
      },
      poster: {
        mode: 'url',
        file: null,
        url: 'https://images.example/poster.png',
      },
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: feedKeys.all() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: gigFormKeys.all() });
    expect(onSuccess).toHaveBeenCalledWith({ publicId: 'arctic-monkeys-2026-07-01' });
  });

  it('should show validation toast and skip submit when poster URL is invalid', async () => {
    const queryClient = createTestQueryClient();
    const apiCall = vi.fn<(params: GigUpsertApiParams) => Promise<GigUpsertResponse>>();
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useGigSubmit({
          posterFile: null,
          posterUrl: 'not-a-url',
          apiCall,
          onSuccess,
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.onSubmit(DEFAULT_SUBMIT_VALUES);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: 'Invalid poster URL',
      description: 'Please paste a valid image URL.',
      variant: 'destructive',
    });
    expect(apiCall).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should show submit error toast when API request fails', async () => {
    const queryClient = createTestQueryClient();
    const apiCall = vi
      .fn<(params: GigUpsertApiParams) => Promise<GigUpsertResponse>>()
      .mockRejectedValueOnce(new Error('Request failed'));
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useGigSubmit({
          posterFile: null,
          posterUrl: 'https://images.example/poster.png',
          apiCall,
          onSuccess,
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.onSubmit(DEFAULT_SUBMIT_VALUES);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: "Couldn't submit",
      description: 'Request failed',
      variant: 'destructive',
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
  });
});
