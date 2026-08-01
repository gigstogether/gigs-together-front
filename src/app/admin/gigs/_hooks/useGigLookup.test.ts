// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import type { GigLookupData } from '@/app/admin/gigs/_lib/gig-form-api';
import type { UseFormReturn } from 'react-hook-form';

import { lookupGig } from '@/app/admin/gigs/_lib/gig-form-api';
import { useGigLookup } from '@/app/admin/gigs/_hooks/useGigLookup';
import { defaultGigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { toastMock } = vi.hoisted(() => ({
  toastMock: vi.fn(),
}));

const { lookupGigMock } = vi.hoisted(() => ({
  lookupGigMock: vi.fn<typeof lookupGig>(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: toastMock,
}));

vi.mock('@/app/admin/gigs/_lib/telegram-init-data-expired', () => ({
  toastTelegramInitDataExpired: vi.fn(() => false),
}));

vi.mock('@/app/admin/gigs/_lib/gig-form-api', () => ({
  lookupGig: lookupGigMock,
}));

interface RenderUseGigLookupParams {
  readonly formValues?: Partial<GigFormValues>;
  readonly setPosterFile?: (file: File | null) => void;
  readonly setPosterUrl?: (url: string) => void;
}

interface RenderUseGigLookupResult {
  readonly form: UseFormReturn<GigFormValues>;
  readonly lookup: ReturnType<typeof useGigLookup>;
}

const DEFAULT_LOOKUP_FORM_VALUES: GigFormValues = {
  ...defaultGigFormValues,
  title: 'Arctic Monkeys',
  city: 'Barcelona',
  country: 'ES',
};

function createLookupData(overrides: Partial<GigLookupData> = {}): GigLookupData {
  return {
    title: 'Arctic Monkeys',
    date: '2026-07-01',
    endDate: '2026-07-02',
    city: 'Barcelona',
    country: 'es',
    venue: 'Razzmatazz',
    ticketsUrl: 'https://tickets.example/gig',
    posterUrl: 'https://images.example/poster.png',
    ...overrides,
  };
}

function renderUseGigLookup(params: RenderUseGigLookupParams = {}) {
  const { formValues, setPosterFile = vi.fn(), setPosterUrl = vi.fn() } = params;
  const queryClient = createTestQueryClient();

  return renderHook<RenderUseGigLookupResult, void>(
    () => {
      const form = useForm<GigFormValues>({
        defaultValues: {
          ...DEFAULT_LOOKUP_FORM_VALUES,
          ...formValues,
        },
      });

      return {
        form,
        lookup: useGigLookup(form, setPosterFile, setPosterUrl),
      };
    },
    {
      wrapper: createQueryClientWrapper(queryClient),
    },
  );
}

async function triggerLookup(onLookup: () => Promise<void>): Promise<void> {
  await act(async () => {
    await onLookup();
  });
}

describe('useGigLookup', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should call lookup API with trimmed title and location when lookup starts', async () => {
    vi.mocked(lookupGig).mockResolvedValueOnce(createLookupData());

    const { result } = renderUseGigLookup({
      formValues: {
        title: '  Arctic Monkeys  ',
        city: '  Barcelona  ',
        country: '  ES  ',
      },
    });

    await triggerLookup(result.current.lookup.onLookup);

    expect(vi.mocked(lookupGig)).toHaveBeenCalledWith({
      name: 'Arctic Monkeys',
      location: 'Barcelona, ES',
    });
  });

  it('should apply returned gig values to the form when API returns a match', async () => {
    vi.mocked(lookupGig).mockResolvedValueOnce(createLookupData());

    const { result } = renderUseGigLookup({
      formValues: {
        title: '  Arctic Monkeys  ',
        city: '  Barcelona  ',
        country: '  ES  ',
      },
    });

    await triggerLookup(result.current.lookup.onLookup);

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

  it('should update poster state when API returns a valid poster URL', async () => {
    vi.mocked(lookupGig).mockResolvedValueOnce(createLookupData());

    const setPosterFile = vi.fn<(file: File | null) => void>();
    const setPosterUrl = vi.fn<(url: string) => void>();
    const { result } = renderUseGigLookup({
      setPosterFile,
      setPosterUrl,
    });

    await triggerLookup(result.current.lookup.onLookup);

    expect(setPosterFile).toHaveBeenCalledWith(null);
    expect(setPosterUrl).toHaveBeenCalledWith('https://images.example/poster.png');
  });

  it('should show success toast when API returns a match', async () => {
    vi.mocked(lookupGig).mockResolvedValueOnce(createLookupData());

    const { result } = renderUseGigLookup();

    await triggerLookup(result.current.lookup.onLookup);

    expect(toastMock).toHaveBeenCalledWith({
      title: 'Filled from AI',
      description: 'Fields were updated from lookup results.',
    });
  });

  it('should show not found toast when API does not find a matching gig', async () => {
    vi.mocked(lookupGig).mockResolvedValueOnce(null);

    const { result } = renderUseGigLookup();

    await triggerLookup(result.current.lookup.onLookup);

    expect(toastMock).toHaveBeenCalledWith({
      title: 'Not found',
      description: 'AI could not find a matching future gig for this title and place.',
    });
  });

  it('should show error toast when lookup request fails', async () => {
    const error = new Error('Lookup failed');
    vi.mocked(lookupGig).mockRejectedValueOnce(error);

    const { result } = renderUseGigLookup();

    await triggerLookup(result.current.lookup.onLookup);

    expect(toastMock).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to start AI lookup.',
      variant: 'destructive',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Lookup failed',
      }),
    );
    expect(consoleErrorSpy.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });

  it('should show invalid poster toast and still apply poster URL when lookup returns malformed poster URL', async () => {
    vi.mocked(lookupGig).mockResolvedValueOnce(
      createLookupData({
        posterUrl: 'not-a-url',
      }),
    );

    const setPosterFile = vi.fn<(file: File | null) => void>();
    const setPosterUrl = vi.fn<(url: string) => void>();
    const { result } = renderUseGigLookup({
      setPosterFile,
      setPosterUrl,
    });

    await triggerLookup(result.current.lookup.onLookup);

    expect(toastMock).toHaveBeenCalledWith({
      title: 'Invalid poster URL',
      description: 'Please review/fix the poster link.',
      variant: 'destructive',
    });
  });

  it('should keep malformed poster URL in poster state when lookup returns malformed poster URL', async () => {
    vi.mocked(lookupGig).mockResolvedValueOnce(createLookupData({ posterUrl: 'not-a-url' }));

    const setPosterFile = vi.fn<(file: File | null) => void>();
    const setPosterUrl = vi.fn<(url: string) => void>();
    const { result } = renderUseGigLookup({
      setPosterFile,
      setPosterUrl,
    });

    await triggerLookup(result.current.lookup.onLookup);

    expect(setPosterFile).toHaveBeenCalledWith(null);
    expect(setPosterUrl).toHaveBeenCalledWith('not-a-url');
  });
});
