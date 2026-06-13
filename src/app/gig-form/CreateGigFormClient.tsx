'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Country } from '@/lib/countries.server';
import { useRouter } from 'next/navigation';
import GigFormFields from '@/app/gig-form/_components/GigFormFields';
import PosterField from '@/app/gig-form/_components/PosterField';
import { buildGigFormEditPath, GIG_FORM_ADMIN_BASE_PATH } from '@/app/gig-form/gig-form-paths';
import { createGig } from '@/lib/gig-form-api';
import { getTelegramStartParam } from '@/lib/telegram-webapp';
import { defaultGigFormValues, gigFormSchema } from '@/app/gig-form/gig-form.shared';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';
import { useGigLookup } from '@/app/gig-form/useGigLookup';
import { useGigSubmit } from '@/app/gig-form/useGigSubmit';

interface CreateGigFormClientProps {
  readonly countries: Country[];
  readonly successReturnHref?: string;
}

export default function CreateGigFormClient(props: CreateGigFormClientProps) {
  const { countries, successReturnHref } = props;
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
    apiCall: ({ gig, poster }) => createGig({ gig, poster }),
    onSuccess: () => {
      toast({
        title: 'Sent!',
        description: "Thanks — we'll review it and (hopefully) announce it soon.",
      });
      if (successReturnHref) {
        router.push(successReturnHref);
      } else {
        router.back();
      }
    },
  });

  useEffect(() => {
    // Telegram deep-link: https://t.me/<bot>/<app>?startapp=<token>
    // Telegram passes it as `start_param` in initDataUnsafe and also duplicates as `tgWebAppStartParam` in query.
    const token = getTelegramStartParam().trim();
    if (!token) return;
    // Keep token format aligned with backend publicId rules.
    if (!/^[a-z0-9-]{1,64}$/i.test(token)) return;
    router.replace(buildGigFormEditPath(GIG_FORM_ADMIN_BASE_PATH, token));
  }, [router]);

  function clearPoster() {
    setPosterFile(null);
    setPosterUrl('');
    if (posterFileInputRef.current) {
      posterFileInputRef.current.value = '';
    }
  }

  return (
    <Card className="w-full max-w-md m-auto border-0">
      <CardHeader>
        <CardTitle>Suggest a gig</CardTitle>
        <CardDescription>Create a gig entry in the system.</CardDescription>
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
  );
}
