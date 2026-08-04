import { useMutation } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { lookupGig } from '@/app/admin/gigs/_lib/gig-form-api';
import type { GigLookupData } from '@/app/admin/gigs/_lib/gig-form-api';
import { toastTelegramInitDataExpired } from '@/app/admin/gigs/_lib/telegram-init-data-expired';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';

export interface GigLookupInput {
  readonly title: string;
  readonly city: string;
  readonly country: string;
}

export interface UseGigLookupResult {
  readonly isLookingUp: boolean;
  readonly onLookup: () => Promise<void>;
}

interface GigLookupRequest {
  readonly name: string;
  readonly location: string;
}

function buildLookupRequest(input: GigLookupInput): GigLookupRequest {
  const name = input.title.trim();
  const city = input.city.trim();
  const country = input.country.trim();
  const location = [city, country].filter(Boolean).join(', ');

  if (!name) {
    throw new Error('Lookup requires "title"');
  }
  if (!location) {
    throw new Error('Lookup requires "city" and "country"');
  }

  return { name, location };
}

export function useGigLookup(
  form: UseFormReturn<GigFormValues>,
  setPosterFile: (file: File | null) => void,
  setPosterUrl: (url: string) => void,
): UseGigLookupResult {
  const mutation = useMutation<GigLookupData | null, Error, GigLookupInput>({
    mutationFn: (input: GigLookupInput): Promise<GigLookupData | null> => {
      const request = buildLookupRequest(input);
      return lookupGig(request);
    },
  });

  function setPoster(posterUrl?: string) {
    if (!posterUrl) return;
    const nextPosterUrl = posterUrl.trim();
    try {
      new URL(nextPosterUrl);
      setPosterFile(null);
      setPosterUrl(nextPosterUrl);
    } catch {
      setPosterFile(null);
      setPosterUrl(nextPosterUrl);
      toast({
        title: 'Invalid poster URL',
        description: 'Please review/fix the poster link.',
        variant: 'destructive',
      });
    }
  }

  function applyLookupResult(result: GigLookupData) {
    form.setValue('date', result.date, { shouldDirty: true });

    const GIG_LOOKUP_OPTIONAL_FORM_FIELD_NAMES = [
      'title',
      'endDate',
      'city',
      'venue',
      'ticketsUrl',
    ] as const;

    for (const fieldName of GIG_LOOKUP_OPTIONAL_FORM_FIELD_NAMES) {
      const fieldValue = result[fieldName];
      if (!fieldValue) {
        continue;
      }
      form.setValue(fieldName, fieldValue, { shouldDirty: true });
    }

    if (result.country) {
      form.setValue('country', result.country.toUpperCase(), { shouldDirty: true });
    }

    setPoster(result.posterUrl);
  }

  function handleLookupSuccess(result: GigLookupData | null) {
    if (!result) {
      toast({
        title: 'Not found',
        description: 'AI could not find a matching future gig for this title and place.',
      });
      return;
    }

    applyLookupResult(result);
    toast({
      title: 'Filled from AI',
      description: 'Fields were updated from lookup results.',
    });
  }

  function handleLookupError(error: unknown) {
    if (!toastTelegramInitDataExpired(error)) {
      toast({
        title: 'Error',
        description: 'Failed to start AI lookup.',
        variant: 'destructive',
      });
    }
    console.error(error);
  }

  async function onLookup(): Promise<void> {
    if (mutation.isPending) return;
    const input: GigLookupInput = {
      title: form.getValues('title')?.trim() ?? '',
      city: form.getValues('city')?.trim() ?? '',
      country: form.getValues('country')?.trim() ?? '',
    };

    try {
      const result = await mutation.mutateAsync(input);
      handleLookupSuccess(result);
    } catch (e) {
      handleLookupError(e);
    }
  }

  return {
    isLookingUp: mutation.isPending,
    onLookup,
  };
}
