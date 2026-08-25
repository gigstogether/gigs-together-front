'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import {
  createAdminGigCandidate,
  lookupAdminGigCandidateDraft,
  updateAdminGigCandidateDraft,
} from '@/app/admin/_lib/admin-api';
import type { LookupAdminGigCandidateDraftParams } from '@/app/admin/_lib/admin-api';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import GigFormFields from '@/app/admin/gigs/_components/gig-form/GigFormFields';
import type {
  AdminGigCandidate,
  AdminGigCandidateLookupResult,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import {
  defaultGigCandidateDraftFormValues,
  gigCandidateDraftFormSchema,
  mapGigCandidateDraftToFormValues,
  mapGigCandidateFormValuesToDraft,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate-form';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import { toastTelegramInitDataExpired } from '@/app/admin/gigs/_lib/telegram-init-data-expired';
import PosterField from '@/components/PosterField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Country } from '@/lib/api-boundary-schemas';
import { ApiError } from '@/lib/api-errors';
import { buildAdminGigCandidateRoute } from '@/lib/admin-gig-candidate-paths';

interface AdminGigCandidateDraftFormProps {
  countries: Country[];
  gigCandidate?: AdminGigCandidate;
}

interface UseGigCandidateLookupResult {
  isLookingUp: boolean;
  lookupGigCandidateDraft: () => Promise<void>;
}

const GIG_CANDIDATE_LOOKUP_OPTIONAL_FORM_FIELDS = [
  'title',
  'endDate',
  'city',
  'venue',
  'ticketsUrl',
] as const;

function useGigCandidateLookup(
  form: UseFormReturn<GigFormValues>,
  setPosterFile: (file: File | null) => void,
  setPosterUrl: (url: string) => void,
): UseGigCandidateLookupResult {
  const lookupMutation = useMutation({
    mutationFn: (params: LookupAdminGigCandidateDraftParams) =>
      lookupAdminGigCandidateDraft(params),
  });

  function applyGigCandidateLookupResult(result: AdminGigCandidateLookupResult) {
    form.setValue('date', result.date, { shouldDirty: true });
    for (const fieldName of GIG_CANDIDATE_LOOKUP_OPTIONAL_FORM_FIELDS) {
      const fieldValue = result[fieldName];
      if (fieldValue) {
        form.setValue(fieldName, fieldValue, { shouldDirty: true });
      }
    }
    if (result.country) {
      form.setValue('country', result.country.toUpperCase(), { shouldDirty: true });
    }
    if (result.posterUrl) {
      const nextPosterUrl = result.posterUrl.trim();
      setPosterFile(null);
      setPosterUrl(nextPosterUrl);
      try {
        new URL(nextPosterUrl);
      } catch {
        toast({
          title: 'Invalid poster URL',
          description: 'Please review/fix the poster link.',
          variant: 'destructive',
        });
      }
    }
  }

  async function lookupGigCandidateDraft(): Promise<void> {
    if (lookupMutation.isPending) {
      return;
    }
    const title = form.getValues('title').trim();
    const location = [form.getValues('city').trim(), form.getValues('country').trim()]
      .filter(Boolean)
      .join(', ');

    try {
      const result = await lookupMutation.mutateAsync({ title, location });
      if (!result) {
        toast({
          title: 'Not found',
          description: 'AI could not find a matching future gig for this title and place.',
        });
        return;
      }
      applyGigCandidateLookupResult(result);
      toast({
        title: 'Filled from AI',
        description: 'Fields were updated from lookup results.',
      });
    } catch (e) {
      if (!toastTelegramInitDataExpired(e)) {
        toast({
          title: 'Error',
          description: 'Failed to start AI lookup.',
          variant: 'destructive',
        });
      }
    }
  }

  return {
    isLookingUp: lookupMutation.isPending,
    lookupGigCandidateDraft,
  };
}

export default function AdminGigCandidateDraftForm(props: AdminGigCandidateDraftFormProps) {
  const { countries, gigCandidate } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState('');
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigCandidateDraftFormSchema),
    defaultValues: gigCandidate
      ? mapGigCandidateDraftToFormValues(gigCandidate.gigDraft)
      : defaultGigCandidateDraftFormValues,
  });
  const { isLookingUp, lookupGigCandidateDraft } = useGigCandidateLookup(
    form,
    setPosterFile,
    setPosterUrl,
  );

  const saveMutation = useMutation({
    mutationFn: async (values: GigFormValues) => {
      const gigDraft = mapGigCandidateFormValuesToDraft(values);
      const poster = { file: posterFile, url: posterUrl };
      return gigCandidate
        ? updateAdminGigCandidateDraft({
            gigCandidateId: gigCandidate.id,
            expectedVersion: gigCandidate.version,
            gigDraft,
            poster,
          })
        : createAdminGigCandidate({ gigDraft, poster });
    },
    onSuccess: async (savedGigCandidate) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminKeys.gigCandidatesRoot() }),
        queryClient.invalidateQueries({
          queryKey: adminKeys.gigCandidateById(savedGigCandidate.id),
        }),
      ]);
      toast({ title: gigCandidate ? 'Gig Candidate saved' : 'Gig Candidate created' });
      router.push(buildAdminGigCandidateRoute(savedGigCandidate.id));
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.statusCode === 409 && gigCandidate) {
        await queryClient.invalidateQueries({
          queryKey: adminKeys.gigCandidateById(gigCandidate.id),
        });
        toast({
          title: 'Gig Candidate changed elsewhere',
          description: 'Reload the latest version before saving again.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Could not save Gig Candidate',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
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
    <Card>
      <CardHeader>
        <CardTitle>{gigCandidate ? 'Edit Gig Candidate' : 'Create Gig Candidate'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        >
          <GigFormFields
            form={form}
            countries={countries}
            isSubmitting={saveMutation.isPending}
            allowEmptyCountry
            isLookingUp={isLookingUp}
            onLookup={lookupGigCandidateDraft}
          />
          <PosterField
            variant={gigCandidate ? 'edit' : 'create'}
            posterFile={posterFile}
            onPosterFileChange={setPosterFile}
            posterUrl={posterUrl}
            onPosterUrlChange={setPosterUrl}
            onClearPoster={clearPoster}
            posterFileInputRef={posterFileInputRef}
            existingPosterUrl={gigCandidate?.gigDraft.posterUrl}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={saveMutation.isPending || isLookingUp}
          >
            {saveMutation.isPending
              ? 'Saving…'
              : gigCandidate
                ? 'Save changes'
                : 'Create Gig Candidate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
