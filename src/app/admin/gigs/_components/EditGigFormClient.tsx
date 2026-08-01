'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Country } from '@/lib/countries.server';
import { useRouter } from 'next/navigation';
import GigFormFields from '@/app/admin/gigs/_components/gig-form/GigFormFields';
import PosterField from '@/app/admin/gigs/_components/gig-form/PosterField';
import type { GigUpsertResponse } from '@/app/admin/gigs/_lib/gig-form-api';
import { updateGig } from '@/app/admin/gigs/_lib/gig-form-api';
import { defaultGigFormValues, gigFormSchema } from '@/app/admin/gigs/_lib/gig-form.shared';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import { useEditGigFormData } from '@/app/admin/gigs/_hooks/useEditGigFormData';
import { useGigLookup } from '@/app/admin/gigs/_hooks/useGigLookup';
import { useGigSubmit } from '@/app/admin/gigs/_hooks/useGigSubmit';
import { buildAdminGigPublicIdRoute } from '@/lib/admin-gig-paths';
import { cn } from '@/lib/utils';
import { GIG_STATUS_DOT_CLASS_NAMES } from '@/app/admin/gigs/_lib/admin-gig-status';

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

  const { existingPosterUrl, gigStatus, isLoadingGig, loadGigError, isPrefilled, retryLoadingGig } =
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
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Edit gig</CardTitle>
              {!!gigStatus && (
                <div
                  className="inline-flex h-7 items-center gap-2 rounded-full border border-input bg-muted/30 px-2.5 text-xs text-muted-foreground"
                  title={`Status: ${gigStatus}`}
                  aria-label={`Status: ${gigStatus}`}
                >
                  <span
                    className={cn(
                      'inline-block h-2 w-2 shrink-0 rounded-full',
                      GIG_STATUS_DOT_CLASS_NAMES[gigStatus],
                    )}
                    aria-hidden
                  />
                  <span>{gigStatus}</span>
                </div>
              )}
            </div>
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
