// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import type { GigFormData } from '@/lib/gig-form-api';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';
import type { UseFormReturn } from 'react-hook-form';

import { defaultGigFormValues } from '@/app/gig-form/gig-form.shared';
import { fetchGigByPublicId } from '@/lib/gig-form-api';
import { useEditGigFormData } from '@/app/gig-form/useEditGigFormData';
import { createQueryClientWrapper, createTestQueryClient } from '@/test-utils/react-query-client';

const { toastMock } = vi.hoisted(() => ({
  toastMock: vi.fn(),
}));

const { fetchGigByPublicIdMock } = vi.hoisted(() => ({
  fetchGigByPublicIdMock: vi.fn<typeof fetchGigByPublicId>(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: toastMock,
}));

vi.mock('@/lib/telegram-init-data-expired', () => ({
  getTelegramInitDataExpiredToastContent: vi.fn(() => null),
}));

vi.mock('@/lib/gig-form-api', async () => {
  const actual = await vi.importActual('@/lib/gig-form-api');
  return {
    ...actual,
    fetchGigByPublicId: fetchGigByPublicIdMock,
  };
});

interface RenderUseEditGigFormDataResult {
  readonly form: UseFormReturn<GigFormValues>;
  readonly editGigData: ReturnType<typeof useEditGigFormData>;
}

function createGigFormData(overrides: Partial<GigFormData> = {}): GigFormData {
  return {
    publicId: 'gig-public-id',
    title: 'Arctic Monkeys',
    date: '2026-07-01T20:00:00.000Z',
    endDate: '2026-07-02T22:00:00.000Z',
    city: 'Barcelona',
    country: 'es',
    venue: 'Razzmatazz',
    ticketsUrl: 'https://tickets.example/gig',
    posterUrl: 'https://images.example/poster.png',
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
    vi.mocked(fetchGigByPublicId).mockResolvedValueOnce(createGigFormData());

    const { result } = renderUseEditGigFormData();

    await waitFor(() => {
      expect(result.current.editGigData.isPrefilled).toBe(true);
    });

    expect(vi.mocked(fetchGigByPublicId)).toHaveBeenCalledWith({
      publicId: 'gig-public-id',
      signal: expect.any(AbortSignal),
    });
    expect(result.current.editGigData.existingPosterUrl).toBe('https://images.example/poster.png');
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
    vi.mocked(fetchGigByPublicId).mockRejectedValueOnce(new Error('Request failed'));

    const { result } = renderUseEditGigFormData();

    await waitFor(() => {
      expect(result.current.editGigData.loadGigError).toBe('Request failed');
    });

    expect(result.current.editGigData.isPrefilled).toBe(false);
    expect(toastMock).toHaveBeenCalledWith({
      title: "Couldn't load gig",
      description: 'Request failed',
      variant: 'destructive',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should retry loading and prefill form when retry succeeds', async () => {
    vi.mocked(fetchGigByPublicId)
      .mockRejectedValueOnce(new Error('Request failed'))
      .mockResolvedValueOnce(createGigFormData());

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

    expect(vi.mocked(fetchGigByPublicId)).toHaveBeenCalledTimes(2);
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
