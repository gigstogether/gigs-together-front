// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import type { AdminGigFormData } from '@/app/admin/gigs/_lib/types';
import { GigStatusAPI } from '@/app/admin/gigs/_lib/types';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import { defaultGigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import { fetchAdminGigByPublicId } from '@/app/admin/_lib/admin-api';
import { useEditGigFormData } from '@/app/admin/gigs/_hooks/useEditGigFormData';
import { createQueryClientWrapper, createTestQueryClient } from '@/test-utils/react-query-client';

const { toastMock } = vi.hoisted(() => ({
  toastMock: vi.fn(),
}));

const { fetchAdminGigByPublicIdMock } = vi.hoisted(() => ({
  fetchAdminGigByPublicIdMock: vi.fn<typeof fetchAdminGigByPublicId>(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: toastMock,
}));

vi.mock('@/lib/telegram-init-data-expired', () => ({
  getTelegramInitDataExpiredToastContent: vi.fn(() => null),
}));

vi.mock('@/app/admin/_lib/admin-api', async () => {
  const actual = await vi.importActual('@/app/admin/_lib/admin-api');
  return {
    ...actual,
    fetchAdminGigByPublicId: fetchAdminGigByPublicIdMock,
  };
});

interface RenderUseEditGigFormDataResult {
  readonly form: UseFormReturn<GigFormValues>;
  readonly editGigData: ReturnType<typeof useEditGigFormData>;
}

function createAdminGigFormData(overrides: Partial<AdminGigFormData> = {}): AdminGigFormData {
  return {
    publicId: 'gig-public-id',
    title: 'Arctic Monkeys',
    status: GigStatusAPI.Pending,
    date: '2026-07-01T20:00:00.000Z',
    endDate: '2026-07-02T22:00:00.000Z',
    city: 'Barcelona',
    country: 'es',
    venue: 'Razzmatazz',
    ticketsUrl: 'https://tickets.example/gig',
    posterUrl: 'https://images.example/poster.png',
    suggestedBy: { userId: '42' },
    ...overrides,
  };
}

function renderUseEditGigFormData() {
  const queryClient = createTestQueryClient();
  const setPosterFile = vi.fn<(file: File | null) => void>();
  const setPosterUrl = vi.fn<(url: string) => void>();

  return renderHook<RenderUseEditGigFormDataResult, void>(
    () => {
      const form = useForm<GigFormValues>({
        defaultValues: defaultGigFormValues,
      });

      return {
        form,
        editGigData: useEditGigFormData({
          form,
          gigPublicId: 'gig-public-id',
          setPosterFile,
          setPosterUrl,
        }),
      };
    },
    {
      wrapper: createQueryClientWrapper(queryClient),
    },
  );
}

describe('useEditGigFormData', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should prefill form values and poster URL when gig data loads successfully', async () => {
    vi.mocked(fetchAdminGigByPublicId).mockResolvedValueOnce(createAdminGigFormData());

    const { result } = renderUseEditGigFormData();

    await waitFor(() => {
      expect(result.current.editGigData.isPrefilled).toBe(true);
    });

    expect(vi.mocked(fetchAdminGigByPublicId)).toHaveBeenCalledWith({
      publicId: 'gig-public-id',
      signal: expect.any(AbortSignal),
    });
    expect(result.current.editGigData.existingPosterUrl).toBe('https://images.example/poster.png');
    expect(result.current.editGigData.gigStatus).toBe(GigStatusAPI.Pending);
    expect(result.current.form.getValues()).toEqual({
      title: 'Arctic Monkeys',
      date: '2026-07-01',
      endDate: '2026-07-02',
      city: 'Barcelona',
      country: 'ES',
      venue: 'Razzmatazz',
      ticketsUrl: 'https://tickets.example/gig',
    });
  });

  it('should expose load error and show toast when gig data request fails', async () => {
    vi.mocked(fetchAdminGigByPublicId).mockRejectedValueOnce(new Error('Request failed'));

    const { result } = renderUseEditGigFormData();

    await waitFor(() => {
      expect(result.current.editGigData.loadGigError).toBe('Request failed');
    });

    expect(result.current.editGigData.isPrefilled).toBe(false);
    expect(result.current.editGigData.gigStatus).toBe(null);
    expect(toastMock).toHaveBeenCalledWith({
      title: "Couldn't load gig",
      description: 'Request failed',
      variant: 'destructive',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should retry loading and prefill form when retry succeeds', async () => {
    vi.mocked(fetchAdminGigByPublicId)
      .mockRejectedValueOnce(new Error('Request failed'))
      .mockResolvedValueOnce(createAdminGigFormData());

    const { result } = renderUseEditGigFormData();

    await waitFor(() => {
      expect(result.current.editGigData.loadGigError).toBe('Request failed');
    });

    await act(async () => {
      await result.current.editGigData.retryLoadingGig();
    });

    await waitFor(() => {
      expect(result.current.editGigData.isPrefilled).toBe(true);
    });

    expect(vi.mocked(fetchAdminGigByPublicId)).toHaveBeenCalledTimes(2);
    expect(result.current.editGigData.gigStatus).toBe(GigStatusAPI.Pending);
    expect(result.current.form.getValues()).toEqual({
      title: 'Arctic Monkeys',
      date: '2026-07-01',
      endDate: '2026-07-02',
      city: 'Barcelona',
      country: 'ES',
      venue: 'Razzmatazz',
      ticketsUrl: 'https://tickets.example/gig',
    });
  });
});
