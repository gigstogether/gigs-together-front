// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';

import { useSuggestGigSubmit } from '@/app/(default)/suggest/_hooks/use-suggest-gig-submit';
import type {
  GigCandidateCreateResponse,
  GigCandidateUpsertApiParams,
} from '@/app/(default)/suggest/_lib/gig-candidate-api';
import { defaultSuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import type { SuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { toastMock } = vi.hoisted(() => ({
  toastMock: vi.fn(),
}));

const { createGigCandidateMock } = vi.hoisted(() => ({
  createGigCandidateMock:
    vi.fn<(params: GigCandidateUpsertApiParams) => Promise<GigCandidateCreateResponse>>(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: toastMock,
}));

vi.mock('@/app/(default)/suggest/_lib/gig-candidate-api', () => ({
  createGigCandidate: createGigCandidateMock,
}));

const DEFAULT_SUBMIT_VALUES: SuggestGigFormValues = {
  ...defaultSuggestGigFormValues,
  title: 'Arctic Monkeys',
  date: '2026-07-01',
  city: 'Barcelona',
  country: 'ES',
  venue: 'Razzmatazz',
  ticketsUrl: 'https://tickets.example/gig',
};

describe('useSuggestGigSubmit', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should call createGigCandidate and onSuccess when submission succeeds', async () => {
    const queryClient = createTestQueryClient();
    createGigCandidateMock.mockResolvedValueOnce({ id: '507f1f77bcf86cd799439099' });
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useSuggestGigSubmit({
          posterFile: null,
          posterUrl: 'https://images.example/poster.png',
          onSuccess,
        }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.onSubmit(DEFAULT_SUBMIT_VALUES);
    });

    expect(createGigCandidateMock).toHaveBeenCalledWith({
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
    expect(onSuccess).toHaveBeenCalledWith({ id: '507f1f77bcf86cd799439099' });
  });

  it('should show validation toast and skip submit when poster URL is invalid', async () => {
    const queryClient = createTestQueryClient();
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useSuggestGigSubmit({
          posterFile: null,
          posterUrl: 'not-a-url',
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
    expect(createGigCandidateMock).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should show error toast when createGigCandidate rejects', async () => {
    const queryClient = createTestQueryClient();
    createGigCandidateMock.mockRejectedValueOnce(new Error('API down'));
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useSuggestGigSubmit({
          posterFile: null,
          posterUrl: '',
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
      description: 'API down',
      variant: 'destructive',
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
