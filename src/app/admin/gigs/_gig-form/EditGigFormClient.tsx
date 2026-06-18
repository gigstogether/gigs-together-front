'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Country } from '@/lib/countries.server';
import { useRouter } from 'next/navigation';
import GigFormFields from '@/app/admin/gigs/_gig-form/_components/GigFormFields';
import PosterField from '@/app/admin/gigs/_gig-form/_components/PosterField';
import type { GigUpsertResponse } from '@/lib/gig-form-api';
import { updateGig } from '@/lib/gig-form-api';
import { defaultGigFormValues, gigFormSchema } from '@/app/admin/gigs/_gig-form/gig-form.shared';
import type { GigFormValues } from '@/app/admin/gigs/_gig-form/gig-form.shared';
import { useEditGigFormData } from '@/app/admin/gigs/_gig-form/useEditGigFormData';
import { useGigLookup } from '@/app/admin/gigs/_gig-form/useGigLookup';
import { useGigSubmit } from '@/app/admin/gigs/_gig-form/useGigSubmit';
import { buildAdminGigPublicIdRoute } from '@/app/admin/gigs/admin-gig-paths';

interface EditGigFormClientProps {
  readonly countries: Country[];
  readonly gigPublicId: string;
}

export default function EditGigFormClient(props: EditGigFormClientProps) {
  const { countries, gigPublicId } = props;
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
    apiCall: ({ gig, poster }) => updateGig({ publicId: gigPublicId, gig, poster }),
    onSuccess: (result: GigUpsertResponse) => {
      toast({
        title: 'Updated!',
        description: 'Gig was updated.',
      });
      const returnHref = result.publicId && buildAdminGigPublicIdRoute(result.publicId);
      if (returnHref) {
        router.push(returnHref);
      } else {
        router.back();
      }
    },
  });

  const { existingPosterUrl, isLoadingGig, loadGigError, isPrefilled, retryLoadingGig } =
    useEditGigFormData({
      form,
      gigPublicId,
      setPosterFile,
      setPosterUrl,
    });

  function clearPoster() {
    setPosterFile(null);
    setPosterUrl('');
    if (posterFileInputRef.current) {
      posterFileInputRef.current.value = '';
    }
  }

  return (
    <>
      {!isPrefilled ? (
        <Card className="w-full max-w-md m-auto border-0">
          <CardHeader>
            <CardTitle>Edit gig</CardTitle>
            <CardDescription>
              {loadGigError ? `Error: ${loadGigError}` : isLoadingGig ? 'Loading…' : 'Loading…'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadGigError ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  void retryLoadingGig();
                }}
              >
                Retry
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md m-auto border-0">
          <CardHeader>
            <CardTitle>Edit gig</CardTitle>
            <CardDescription>Update gig details.</CardDescription>
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
                isLoading={isLoadingGig}
                onLookup={onLookup}
              />

              <PosterField
                variant="edit"
                posterFile={posterFile}
                onPosterFileChange={setPosterFile}
                posterUrl={posterUrl}
                onPosterUrlChange={setPosterUrl}
                onClearPoster={clearPoster}
                posterFileInputRef={posterFileInputRef}
                existingPosterUrl={existingPosterUrl}
              />

              <Button
                type="submit"
                disabled={isSubmitting || isLoadingGig || !gigPublicId}
                style={{ width: '100%' }}
              >
                {isSubmitting ? 'Submitting...' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
