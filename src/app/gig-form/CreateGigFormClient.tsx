'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Country } from '@/lib/countries.server';
import { useRouter } from 'next/navigation';
import GigFormFields from '@/app/gig-form/_components/GigFormFields';
import PosterField from '@/app/gig-form/_components/PosterField';
import { buildGigFormPublicIdPath, ADMIN_GIGS_BASE_PATH } from '@/app/gig-form/gig-form-paths';
import type { GigUpsertResponse } from '@/lib/gig-form-api';
import { createGig } from '@/lib/gig-form-api';
import { defaultGigFormValues, gigFormSchema } from '@/app/gig-form/gig-form.shared';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';
import { useGigLookup } from '@/app/gig-form/useGigLookup';
import { useGigSubmit } from '@/app/gig-form/useGigSubmit';

interface CreateGigFormClientProps {
  readonly countries: Country[];
}

export default function CreateGigFormClient(props: CreateGigFormClientProps) {
  const { countries } = props;

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
    onSuccess: (result: GigUpsertResponse) => {
      toast({
        title: 'Sent!',
        description: "Thanks — we'll review it and (hopefully) announce it soon.",
      });
      const returnHref =
        result.publicId && buildGigFormPublicIdPath(ADMIN_GIGS_BASE_PATH, result.publicId);
      if (returnHref) {
        router.push(returnHref);
      } else {
        router.back();
      }
    },
  });

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
