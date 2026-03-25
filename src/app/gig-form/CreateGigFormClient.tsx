'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Country } from '@/lib/countries.server';
import { useRouter } from 'next/navigation';
import TelegramWebAppScript from '@/app/gig-form/_components/TelegramWebAppScript';
import GigFormFields from '@/app/gig-form/_components/GigFormFields';
import PosterField from '@/app/gig-form/_components/PosterField';
import { createGig } from '@/lib/gig-form-api';
import { getTelegramStartParam } from '@/lib/telegram-webapp';
import {
  defaultGigFormValues,
  gigFormSchema,
  type GigFormValues,
} from '@/app/gig-form/gig-form.shared';
import { useGigLookup } from '@/app/gig-form/useGigLookup';
import { useGigSubmit } from '@/app/gig-form/useGigSubmit';

interface CreateGigFormClientProps {
  countries: Country[];
}

export default function CreateGigFormClient({ countries }: CreateGigFormClientProps) {
  const router = useRouter();
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: defaultGigFormValues,
  });

  const { isLookingUp, onLookup } = useGigLookup(form, setPosterFile, setPosterUrl);

  const { isSubmitting, onSubmit } = useGigSubmit({
    posterFile,
    posterUrl,
    apiCall: ({ telegramInitDataString, gig, poster }) =>
      createGig({ telegramInitDataString, gig, poster }),
    onSuccess: () => {
      toast({
        title: 'Sent!',
        description: "Thanks — we'll review it and (hopefully) announce it soon.",
      });
      // Reset form for the next submission (keep location defaults)
      const currentCity = form.getValues('city') ?? defaultGigFormValues.city;
      const currentCountry = form.getValues('country') ?? defaultGigFormValues.country;
      form.reset({
        ...defaultGigFormValues,
        city: currentCity,
        country: currentCountry,
      });
      clearPoster();
    },
  });

  useEffect(() => {
    // Telegram deep-link: https://t.me/<bot>/<app>?startapp=<token>
    // Telegram passes it as `start_param` in initDataUnsafe and also duplicates as `tgWebAppStartParam` in query.
    const token = getTelegramStartParam().trim();
    if (!token) return;
    // Keep token format aligned with backend publicId rules.
    if (!/^[a-z0-9-]{1,64}$/i.test(token)) return;
    router.replace(`/gig-form/${encodeURIComponent(token)}/edit`);
  }, [router]);

  function clearPoster() {
    setPosterFile(null);
    setPosterUrl('');
    if (posterFileInputRef.current) {
      posterFileInputRef.current.value = '';
    }
  }

  return (
    <>
      <TelegramWebAppScript />
      <Card className="w-full max-w-md m-auto border-0">
        <CardHeader>
          <CardTitle>Suggest a gig</CardTitle>
          <CardDescription>
            Looking for a gig company? Let us know which gig should we announce!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <GigFormFields
              form={form}
              countries={countries}
              isLookingUp={isLookingUp}
              isSubmitting={isSubmitting}
              onLookup={onLookup}
            />

            <PosterField
              variant="create"
              posterFile={posterFile}
              onPosterFileChange={setPosterFile}
              posterUrl={posterUrl}
              onPosterUrlChange={setPosterUrl}
              onClearPoster={clearPoster}
              posterFileInputRef={posterFileInputRef}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ width: '100%' }}
            >
              {isSubmitting ? 'Submitting...' : 'Suggest'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
