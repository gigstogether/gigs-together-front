import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { feedKeys } from '@/lib/feedKeys';
import { gigFormKeys } from '@/app/admin/gigs/_lib/gigFormKeys';
import { toastTelegramInitDataExpired } from '@/lib/telegram-init-data-expired';

import type { GigUpsertApiParams, GigUpsertPayload, GigUpsertResponse } from '@/lib/gig-form-api';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';

interface UseGigSubmitParams {
  readonly posterFile: File | null;
  readonly posterUrl: string;
  readonly apiCall: (params: GigUpsertApiParams) => Promise<GigUpsertResponse>;
  readonly onSuccess: (result: GigUpsertResponse) => void;
}

interface UseGigSubmitResult {
  readonly isSubmitting: boolean;
  readonly onSubmit: (values: GigFormValues) => Promise<void>;
}

interface SubmitGigInput {
  readonly values: GigFormValues;
  readonly posterFile: File | null;
  readonly posterUrl: string;
}

function buildGigPayload(values: GigFormValues): GigUpsertPayload {
  return {
    title: values.title,
    date: values.date,
    endDate: values.endDate || undefined,
    city: values.city,
    country: values.country,
    venue: values.venue,
    ticketsUrl: values.ticketsUrl,
  };
}

function isPosterUrlValid(posterUrl: string): boolean {
  if (!posterUrl.trim()) {
    return true;
  }

  try {
    new URL(posterUrl.trim());
    return true;
  } catch {
    return false;
  }
}

export function useGigSubmit(params: UseGigSubmitParams): UseGigSubmitResult {
  const { posterFile, posterUrl, apiCall, onSuccess } = params;

  const queryClient = useQueryClient();
  const submitGigMutation = useMutation<GigUpsertResponse, unknown, SubmitGigInput>({
    mutationFn: (input: SubmitGigInput): Promise<GigUpsertResponse> => {
      const gig = buildGigPayload(input.values);
      const posterMode = input.posterFile ? 'upload' : 'url';

      return apiCall({
        gig,
        poster: { mode: posterMode, file: input.posterFile, url: input.posterUrl },
      });
    },
    onSuccess: async (result) => {
      // TODO: Invalidate only query keys that a gig edit actually affects (e.g. feed events for the
      // current country/city, calendar-available-dates for that pair, edit-by-public-id for this gig)
      // instead of feedKeys.all(). Broad prefixes mark every feed query stale (all locations, anchor
      // dates, calendar lists), which is simple and correct today but may cause extra refetches and
      // network work as the feed surface grows.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: feedKeys.all() }),
        queryClient.invalidateQueries({ queryKey: gigFormKeys.all() }),
      ]);
      onSuccess(result);
    },
  });

  async function onSubmit(values: GigFormValues): Promise<void> {
    if (submitGigMutation.isPending) {
      return;
    }

    if (!posterFile && !isPosterUrlValid(posterUrl)) {
      toast({
        title: 'Invalid poster URL',
        description: 'Please paste a valid image URL.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitGigMutation.mutateAsync({
        values,
        posterFile,
        posterUrl,
      });
    } catch (e) {
      if (toastTelegramInitDataExpired(e)) {
        console.error(e);
        return;
      }

      const message =
        e instanceof Error
          ? e.message
          : typeof e === 'string'
            ? e
            : 'There was an error submitting the form.';

      toast({
        title: "Couldn't submit",
        description: message,
        variant: 'destructive',
      });
      console.error(e);
    }
  }

  return {
    isSubmitting: submitGigMutation.isPending,
    onSubmit,
  };
}
