'use client';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { waitForTelegramInitData } from '@/lib/telegram-webapp';
import type { GigUpsertPayload, PosterSelection } from '@/lib/gig-form-api';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';

interface UseGigSubmitParams {
  posterFile: File | null;
  posterUrl: string;
  apiCall: (params: {
    telegramInitDataString: string;
    gig: GigUpsertPayload;
    poster: PosterSelection;
  }) => Promise<unknown>;
  onSuccess: () => void;
}

export function useGigSubmit({ posterFile, posterUrl, apiCall, onSuccess }: UseGigSubmitParams) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function onSubmit(values: GigFormValues) {
    setIsSubmitting(true);
    try {
      const telegramInitDataString = await waitForTelegramInitData();

      const gig: GigUpsertPayload = {
        title: values.title,
        date: values.date,
        endDate: values.endDate || undefined,
        city: values.city,
        country: values.country,
        venue: values.venue,
        ticketsUrl: values.ticketsUrl,
      };

      const posterMode = posterFile ? 'upload' : 'url';
      if (posterMode === 'url' && posterUrl.trim()) {
        try {
          new URL(posterUrl.trim());
        } catch {
          toast({
            title: 'Invalid poster URL',
            description: 'Please paste a valid image URL.',
            variant: 'destructive',
          });
          return;
        }
      }

      await apiCall({
        telegramInitDataString,
        gig,
        poster: { mode: posterMode, file: posterFile, url: posterUrl },
      });

      onSuccess();
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
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, onSubmit };
}
