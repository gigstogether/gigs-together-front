'use client';

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { lookupGig } from '@/lib/gig-form-api';
import { dateToYMD } from '@/app/gig-form/gig-form.shared';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';

export function useGigLookup(
  form: UseFormReturn<GigFormValues>,
  setPosterFile: (file: File | null) => void,
  setPosterUrl: (url: string) => void,
) {
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);

  async function onLookup() {
    if (isLookingUp) return;
    setIsLookingUp(true);
    try {
      const name = form.getValues('title')?.trim();
      const city = form.getValues('city')?.trim();
      const country = form.getValues('country')?.trim();
      const location = [city, country].filter(Boolean).join(', ');
      if (!name) {
        throw new Error('Lookup requires "title"');
      }
      if (!location) {
        throw new Error('Lookup requires "city" and "country"');
      }
      const data = await lookupGig({ name, location });

      if (!data.date) {
        throw new Error('AI lookup did not return a date');
      }
      const ymd = dateToYMD(data.date);
      if (!ymd) {
        throw new Error('Invalid API response: "gig.date" must be YYYY-MM-DD (or ISO)');
      }
      const ymd2 = data.endDate ? dateToYMD(data.endDate) : undefined;
      if (data.endDate && !ymd2) {
        throw new Error('Invalid API response: "gig.endDate" must be YYYY-MM-DD (or ISO)');
      }

      if (data.title) form.setValue('title', data.title, { shouldDirty: true });
      form.setValue('date', ymd, { shouldDirty: true });
      if (data.endDate) form.setValue('endDate', ymd2 ?? '', { shouldDirty: true });
      if (data.city) form.setValue('city', data.city, { shouldDirty: true });
      if (data.country) {
        form.setValue('country', data.country.toUpperCase(), { shouldDirty: true });
      }
      if (data.venue) form.setValue('venue', data.venue, { shouldDirty: true });
      if (data.ticketsUrl) {
        form.setValue('ticketsUrl', data.ticketsUrl, { shouldDirty: true });
      }
      if (data.posterUrl) {
        const nextPosterUrl = data.posterUrl.trim();
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

      toast({ title: 'Filled from AI', description: 'Fields were updated from lookup results.' });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to start AI lookup.',
        variant: 'destructive',
      });
      console.error(e);
    } finally {
      setIsLookingUp(false);
    }
  }

  return { isLookingUp, onLookup };
}
