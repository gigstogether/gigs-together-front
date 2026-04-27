import { useMutation } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { lookupGig } from '@/lib/gig-form-api';
import type { GigLookupData } from '@/lib/gig-form-api';
import { toastTelegramInitDataExpired } from '@/lib/telegram-init-data-expired';
import { dateToYMD } from '@/app/gig-form/gig-form.shared';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';

export interface GigLookupInput {
  readonly title: string;
  readonly city: string;
  readonly country: string;
}

export interface GigLookupResult {
  readonly title?: string;
  readonly date: string;
  readonly endDate?: string;
  readonly city?: string;
  readonly country?: string;
  readonly venue?: string;
  readonly ticketsUrl?: string;
  readonly posterUrl?: string;
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

function normalizeLookupResult(data: GigLookupData | null): GigLookupResult | null {
  if (!data) {
    return null;
  }

  if (!data.date) {
    throw new Error('AI lookup did not return a date');
  }

  const date = dateToYMD(data.date);
  if (!date) {
    throw new Error('Invalid API response: "gig.date" must be YYYY-MM-DD (or ISO)');
  }

  const endDate = data.endDate ? dateToYMD(data.endDate) : undefined;
  if (data.endDate && !endDate) {
    throw new Error('Invalid API response: "gig.endDate" must be YYYY-MM-DD (or ISO)');
  }

  return {
    title: data.title,
    date,
    endDate,
    city: data.city,
    country: data.country,
    venue: data.venue,
    ticketsUrl: data.ticketsUrl,
    posterUrl: data.posterUrl,
  };
}

export function useGigLookup(
  form: UseFormReturn<GigFormValues>,
  setPosterFile: (file: File | null) => void,
  setPosterUrl: (url: string) => void,
): UseGigLookupResult {
  const mutation = useMutation<GigLookupResult | null, Error, GigLookupInput>({
    mutationFn: async (input) => {
      const request = buildLookupRequest(input);
      const result = await lookupGig(request);

      return normalizeLookupResult(result);
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

  function applyLookupResult(result: GigLookupResult) {
    if (result.title) form.setValue('title', result.title, { shouldDirty: true });
    form.setValue('date', result.date, { shouldDirty: true });
    if (result.endDate) form.setValue('endDate', result.endDate, { shouldDirty: true });
    if (result.city) form.setValue('city', result.city, { shouldDirty: true });
    if (result.country) {
      form.setValue('country', result.country.toUpperCase(), { shouldDirty: true });
    }
    if (result.venue) form.setValue('venue', result.venue, { shouldDirty: true });
    if (result.ticketsUrl) {
      form.setValue('ticketsUrl', result.ticketsUrl, { shouldDirty: true });
    }

    setPoster(result.posterUrl);
  }

  function handleLookupSuccess(result: GigLookupResult | null) {
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
    } catch (error) {
      handleLookupError(error);
    }
  }

  return {
    isLookingUp: mutation.isPending,
    onLookup,
  };
}
