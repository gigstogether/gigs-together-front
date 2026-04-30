import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { toast } from '@/hooks/use-toast';
import { fetchGigByPublicId, normalizeGigApiDate } from '@/lib/gig-form-api';
import { getTelegramInitDataExpiredToastContent } from '@/lib/telegram-init-data-expired';
import { defaultGigFormValues } from '@/app/gig-form/gig-form.shared';

import type { GigFormData } from '@/lib/gig-form-api';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';

const EDIT_GIG_LOAD_TIMEOUT_MS = 15_000; // 15 seconds

interface EditGigFormQueryData {
  readonly formValues: GigFormValues;
  readonly existingPosterUrl: string;
}

interface UseEditGigFormDataParams {
  readonly form: UseFormReturn<GigFormValues>;
  readonly gigPublicId: string;
  readonly setPosterFile: (file: File | null) => void;
  readonly setPosterUrl: (url: string) => void;
}

interface UseEditGigFormDataResult {
  readonly existingPosterUrl: string;
  readonly isLoadingGig: boolean;
  readonly loadGigError: string | null;
  readonly isPrefilled: boolean;
  readonly retryLoadingGig: () => Promise<void>;
}

function buildEditGigFormQueryData(data: GigFormData): EditGigFormQueryData {
  const date = normalizeGigApiDate(data.date, 'gig.date');
  const endDate = data.endDate ? normalizeGigApiDate(data.endDate, 'gig.endDate') : undefined;

  return {
    formValues: {
      ...defaultGigFormValues,
      title: data.title,
      date,
      endDate: endDate ?? '',
      city: data.city,
      country: data.country.toUpperCase(),
      venue: data.venue,
      ticketsUrl: data.ticketsUrl,
    },
    existingPosterUrl: data.posterUrl ?? '',
  };
}

function getLoadGigErrorMessage(error: unknown): string {
  const expiredContent = getTelegramInitDataExpiredToastContent(error);
  if (expiredContent) {
    return expiredContent.description;
  }

  return error instanceof Error
    ? error.message
    : 'There was an error loading gig data for editing.';
}

export function useEditGigFormData(params: UseEditGigFormDataParams): UseEditGigFormDataResult {
  const { form, gigPublicId, setPosterFile, setPosterUrl } = params;

  const [existingPosterUrl, setExistingPosterUrl] = useState<string>('');
  const [isPrefilled, setIsPrefilled] = useState<boolean>(false);
  const appliedGigPublicIdRef = useRef<string | null>(null);
  const handledErrorUpdatedAtRef = useRef<number>(0);
  const trimmedGigPublicId = gigPublicId.trim();

  const query = useQuery<EditGigFormQueryData, Error>({
    queryKey: ['gig-form', 'edit-gig', trimmedGigPublicId],
    enabled: Boolean(trimmedGigPublicId),
    retry: false,
    queryFn: async ({ signal }): Promise<EditGigFormQueryData> => {
      // TODO: fix error "signal is aborted without reason"
      const timeoutController = new AbortController();
      const timeoutId = window.setTimeout(() => {
        timeoutController.abort();
      }, EDIT_GIG_LOAD_TIMEOUT_MS);

      const abortFromQuerySignal = () => {
        timeoutController.abort();
      };

      signal.addEventListener('abort', abortFromQuerySignal);
      try {
        const data = await fetchGigByPublicId({
          publicId: trimmedGigPublicId,
          signal: timeoutController.signal,
        });

        return buildEditGigFormQueryData(data);
      } finally {
        window.clearTimeout(timeoutId);
        signal.removeEventListener('abort', abortFromQuerySignal);
      }
    },
  });

  useEffect(() => {
    appliedGigPublicIdRef.current = null;
    handledErrorUpdatedAtRef.current = 0;
    setIsPrefilled(false);
    setExistingPosterUrl('');
    setPosterFile(null);
    setPosterUrl('');
  }, [trimmedGigPublicId, setPosterFile, setPosterUrl]);

  useEffect(() => {
    if (!trimmedGigPublicId || !query.data || query.isFetching) {
      return;
    }
    if (appliedGigPublicIdRef.current === trimmedGigPublicId) {
      return;
    }

    form.reset(query.data.formValues);
    setExistingPosterUrl(query.data.existingPosterUrl);
    appliedGigPublicIdRef.current = trimmedGigPublicId;
    setIsPrefilled(true);
  }, [form, query.data, query.isFetching, trimmedGigPublicId]);

  useEffect(() => {
    if (!query.error || query.isFetching || appliedGigPublicIdRef.current === trimmedGigPublicId) {
      return;
    }
    if (handledErrorUpdatedAtRef.current === query.errorUpdatedAt) {
      return;
    }

    handledErrorUpdatedAtRef.current = query.errorUpdatedAt;
    setIsPrefilled(false);

    const expiredContent = getTelegramInitDataExpiredToastContent(query.error);
    const message = getLoadGigErrorMessage(query.error);

    toast(
      expiredContent
        ? { ...expiredContent, variant: 'destructive' }
        : {
            title: "Couldn't load gig",
            description: message,
            variant: 'destructive',
          },
    );
    console.error(query.error);
  }, [query.error, query.errorUpdatedAt, query.isFetching, trimmedGigPublicId]);

  const loadGigError = query.isFetching
    ? null
    : query.error
      ? getLoadGigErrorMessage(query.error)
      : null;

  async function retryLoadingGig(): Promise<void> {
    await query.refetch();
  }

  return {
    existingPosterUrl,
    isLoadingGig: query.isPending || query.isFetching,
    loadGigError,
    isPrefilled,
    retryLoadingGig,
  };
}
