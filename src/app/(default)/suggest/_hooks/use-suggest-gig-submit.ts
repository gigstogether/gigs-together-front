import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { createGigCandidate } from '@/app/(default)/suggest/_lib/gig-candidate-api';
import type {
  GigCandidateCreateResponse,
  GigCandidateCreatePayload,
} from '@/app/(default)/suggest/_lib/gig-candidate-api';
import type { SuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import { isApiTransportError } from '@/lib/api-errors';

interface UseSuggestGigSubmitParams {
  posterFile: File | null;
  posterUrl: string;
  onSuccess: (result: GigCandidateCreateResponse) => void;
}

interface UseSuggestGigSubmitResult {
  isSubmitting: boolean;
  onSubmit: (values: SuggestGigFormValues) => Promise<void>;
}

interface SubmitSuggestGigInput {
  values: SuggestGigFormValues;
  posterFile: File | null;
  posterUrl: string;
}

interface BuildPayloadParams {
  values: SuggestGigFormValues;
}

function buildPayload(params: BuildPayloadParams): GigCandidateCreatePayload {
  const { values } = params;

  const payload: GigCandidateCreatePayload = {
    communityId: values.communityId,
    localityId: values.localityId,
    title: values.title,
  };
  if (values.date !== undefined) {
    payload.date = values.date;
  }
  if (values.venueIds.length > 0) {
    payload.venueIds = [...values.venueIds];
  }
  if (values.endDate !== undefined) {
    payload.endDate = values.endDate;
  }
  if (values.ticketsUrl !== undefined) {
    payload.ticketsUrl = values.ticketsUrl;
  }

  return payload;
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

export function useSuggestGigSubmit(params: UseSuggestGigSubmitParams): UseSuggestGigSubmitResult {
  const { posterFile, posterUrl, onSuccess } = params;

  const submitMutation = useMutation<GigCandidateCreateResponse, unknown, SubmitSuggestGigInput>({
    mutationFn: (input: SubmitSuggestGigInput): Promise<GigCandidateCreateResponse> => {
      const gig = buildPayload({ values: input.values });
      const posterMode = input.posterFile ? 'upload' : 'url';

      return createGigCandidate({
        gig,
        poster: { mode: posterMode, file: input.posterFile, url: input.posterUrl },
      });
    },
    onSuccess: (result) => {
      onSuccess(result);
    },
  });

  async function onSubmit(values: SuggestGigFormValues): Promise<void> {
    if (submitMutation.isPending) {
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
      await submitMutation.mutateAsync({
        values,
        posterFile,
        posterUrl,
      });
    } catch (e) {
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
      if (!isApiTransportError(e)) {
        console.error(e);
      }
    }
  }

  return {
    isSubmitting: submitMutation.isPending,
    onSubmit,
  };
}
