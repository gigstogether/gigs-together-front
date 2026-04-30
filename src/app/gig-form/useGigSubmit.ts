import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { feedKeys } from '@/app/feed/_components/feed-client/feedKeys';
import { toastTelegramInitDataExpired } from '@/lib/telegram-init-data-expired';

import type { GigUpsertApiParams, GigUpsertPayload } from '@/lib/gig-form-api';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';

interface UseGigSubmitParams {
  readonly posterFile: File | null;
  readonly posterUrl: string;
  readonly apiCall: (params: GigUpsertApiParams) => Promise<unknown>;
  readonly onSuccess: () => void;
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
  const submitGigMutation = useMutation<unknown, unknown, SubmitGigInput>({
    mutationFn: (input: SubmitGigInput): Promise<unknown> => {
      const gig = buildGigPayload(input.values);
      const posterMode = input.posterFile ? 'upload' : 'url';

      return apiCall({
        gig,
        poster: { mode: posterMode, file: input.posterFile, url: input.posterUrl },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: feedKeys.all() });
      onSuccess();
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
