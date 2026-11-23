'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import {
  createAdminGigCandidate,
  lookupAdminGigCandidateDraft,
  updateAdminGigCandidateDraft,
} from '@/app/admin/_lib/admin-api';
import type {
  CreateAdminGigCandidateParams,
  LookupAdminGigCandidateDraftParams,
  UpdateAdminGigCandidateDraftParams,
} from '@/app/admin/_lib/admin-api';
import { buildVersionedAdminPosterUrl } from '@/app/admin/_lib/admin-poster-url';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminGigCandidateOriginalMessage from '@/app/admin/gig-candidates/_components/AdminGigCandidateOriginalMessage';
import {
  fetchAdminLocalities,
  fetchAdminVenues,
} from '@/app/admin/locations/_lib/admin-locations-api';
import type { AdminLocality, AdminVenue } from '@/app/admin/locations/_lib/admin-locations-api';
import type {
  AdminGigCandidate,
  AdminGigCandidateLookupResult,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import {
  createGigCandidateDraftFormSchema,
  createDefaultGigCandidateDraftFormValues,
  gigCandidateDraftFormSchema,
  mapGigCandidateToFormValues,
  mapGigCandidateFormValuesToDraft,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate-form';
import type { AdminGigCandidateFormValues } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate-form';
import PosterField from '@/components/PosterField';
import DateInput from '@/components/DateInput';
import RequiredIndicator from '@/components/RequiredIndicator';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import type { CountryDisplayOption } from '@/lib/i18n/country-display-name';
import type { CommunityDisplayOption } from '@/lib/community/community-display-option';
import { ApiError } from '@/lib/api-errors';
import { buildAdminGigCandidateRoute } from '@/lib/admin-gig-candidate-paths';
import { GIG_TITLE_MAX_LENGTH } from '@/lib/gig.constants';
import { toSearchKey } from '@/lib/search-text';

interface AdminGigCandidateFormProps {
  communityOptions: CommunityDisplayOption[];
  countries: CountryDisplayOption[];
  gigCandidate?: AdminGigCandidate;
}

interface UseGigCandidateLookupResult {
  isLookingUp: boolean;
  lookupGigCandidateDraft: () => Promise<void>;
}

interface UseGigCandidateLookupParams {
  form: UseFormReturn<AdminGigCandidateFormValues>;
  countries: CountryDisplayOption[];
  localities: AdminLocality[];
  venues: AdminVenue[];
  setPosterFile: (file: File | null) => void;
  setPosterUrl: (url: string) => void;
  setLocationHintText: (value: string) => void;
}

const GIG_CANDIDATE_LOOKUP_OPTIONAL_FORM_FIELDS = ['title', 'endDate', 'ticketsUrl'] as const;

function useGigCandidateLookup(params: UseGigCandidateLookupParams): UseGigCandidateLookupResult {
  const { form, countries, localities, venues, setPosterFile, setPosterUrl, setLocationHintText } =
    params;

  const lookupMutation = useMutation({
    mutationFn: (params: LookupAdminGigCandidateDraftParams) =>
      lookupAdminGigCandidateDraft(params),
  });

  function applyGigCandidateLookupResult(result: AdminGigCandidateLookupResult) {
    const { gigDraft, locationHint } = result;

    form.setValue('date', gigDraft.date, { shouldDirty: true });
    for (const fieldName of GIG_CANDIDATE_LOOKUP_OPTIONAL_FORM_FIELDS) {
      const fieldValue = gigDraft[fieldName];
      if (fieldValue) {
        form.setValue(fieldName, fieldValue, { shouldDirty: true });
      }
    }
    const locationHintParts = [
      locationHint.venue,
      locationHint.locality,
      locationHint.country,
    ].filter((part) => part.length > 0);
    setLocationHintText(locationHintParts.join(' · '));

    if (locationHint.country) {
      const countryIso = locationHint.country.toUpperCase();
      const localitySearchKey = toSearchKey(locationHint.locality);
      const locality = localities.find(
        (candidate) =>
          candidate.countryIso === countryIso &&
          [candidate.name, ...candidate.aliases].some(
            (name) => toSearchKey(name) === localitySearchKey,
          ),
      );
      if (locality === undefined) {
        return;
      }

      form.setValue('countryIso', countryIso, { shouldDirty: true });
      form.setValue('localityId', locality.id, { shouldDirty: true });
      const venueSearchKey = toSearchKey(locationHint.venue);
      const venue = venues.find(
        (candidate) =>
          candidate.isActive &&
          candidate.localityId === locality.id &&
          [candidate.name, ...candidate.aliases].some(
            (name) => toSearchKey(name) === venueSearchKey,
          ),
      );
      if (venue !== undefined) {
        form.setValue('venueIds', [venue.id], { shouldDirty: true });
      }
    }
    if (gigDraft.posterUrl) {
      const nextPosterUrl = gigDraft.posterUrl.trim();
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
    const localityId = form.getValues('localityId');
    const countryIso = form.getValues('countryIso');
    const locality = localities.find((candidate) => candidate.id === localityId);
    const country = countries.find((candidate) => candidate.iso === countryIso);
    const location = [locality?.name, country?.name].filter(Boolean).join(', ');

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
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to start AI lookup.',
        variant: 'destructive',
      });
    }
  }

  return {
    isLookingUp: lookupMutation.isPending,
    lookupGigCandidateDraft,
  };
}

export default function AdminGigCandidateForm(props: AdminGigCandidateFormProps) {
  const { communityOptions, countries, gigCandidate } = props;

  const router = useRouter();
  const queryClient = useQueryClient();
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState('');
  const [locationHintText, setLocationHintText] = useState('');
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<AdminGigCandidateFormValues>({
    resolver: zodResolver(
      gigCandidate ? gigCandidateDraftFormSchema : createGigCandidateDraftFormSchema,
    ),
    defaultValues: gigCandidate
      ? mapGigCandidateToFormValues(gigCandidate)
      : createDefaultGigCandidateDraftFormValues(
          communityOptions.map((community) => community.value),
        ),
  });
  const countryIso = useWatch({ control: form.control, name: 'countryIso' });
  const localityId = useWatch({ control: form.control, name: 'localityId' });
  const selectedVenueIds = useWatch({
    control: form.control,
    name: 'venueIds',
  });
  const localitiesQuery = useQuery({
    queryKey: adminKeys.localities(),
    queryFn: fetchAdminLocalities,
  });
  const venuesQuery = useQuery({
    queryKey: adminKeys.venues(),
    queryFn: fetchAdminVenues,
  });
  const localities = localitiesQuery.data ?? [];
  const venues = venuesQuery.data ?? [];
  const countryOptions = countries.map((country) => ({
    value: country.iso,
    label: country.name,
  }));
  const localityOptions = localities
    .filter((locality) => locality.countryIso === countryIso)
    .map((locality) => ({
      value: locality.id,
      label:
        locality.qualifier === undefined
          ? locality.name
          : `${locality.name} (${locality.qualifier})`,
    }));
  const venueOptions = venues
    .filter(
      (venue) =>
        venue.localityId === localityId && (venue.isActive || selectedVenueIds.includes(venue.id)),
    )
    .map((venue) => ({ value: venue.id, label: venue.name }));
  const { isLookingUp, lookupGigCandidateDraft } = useGigCandidateLookup({
    form,
    countries,
    localities,
    venues,
    setPosterFile,
    setPosterUrl,
    setLocationHintText,
  });
  let existingPosterUrl = gigCandidate?.gigDraft.posterUrl;
  if (existingPosterUrl !== undefined && gigCandidate !== undefined) {
    existingPosterUrl = buildVersionedAdminPosterUrl(existingPosterUrl, gigCandidate.version);
  }

  const saveMutation = useMutation({
    mutationFn: (values: AdminGigCandidateFormValues) => {
      const gigDraft = mapGigCandidateFormValuesToDraft(values);
      const poster = { file: posterFile, url: posterUrl };
      const localityIdValue = values.localityId.trim();
      if (gigCandidate) {
        const params: UpdateAdminGigCandidateDraftParams = {
          gigCandidateId: gigCandidate.id,
          expectedVersion: gigCandidate.version,
          gigDraft,
          poster,
        };
        if (localityIdValue.length > 0) {
          params.localityId = localityIdValue;
        }
        return updateAdminGigCandidateDraft(params);
      }

      const params: CreateAdminGigCandidateParams = {
        gigDraft,
        poster,
      };
      if (localityIdValue.length > 0) {
        params.localityId = localityIdValue;
      }
      return createAdminGigCandidate(params);
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
      <CardContent className="space-y-6">
        {gigCandidate?.originalMessage !== undefined ? (
          <div className="border-b border-border pb-2">
            <AdminGigCandidateOriginalMessage originalMessage={gigCandidate.originalMessage} />
          </div>
        ) : null}
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        >
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="gig-candidate-title">
                  Title:{gigCandidate ? null : <RequiredIndicator />}
                </FieldLabel>
                <Input
                  {...field}
                  id="gig-candidate-title"
                  required={!gigCandidate}
                  maxLength={GIG_TITLE_MAX_LENGTH}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Arctic Monkeys"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="communityIds"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  id="gig-candidate-communities-label"
                  htmlFor="gig-candidate-communities"
                >
                  Communities:
                  <RequiredIndicator />
                </FieldLabel>
                <SearchableSelect
                  id="gig-candidate-communities"
                  name={field.name}
                  selectionMode="multiple"
                  value={field.value}
                  options={communityOptions}
                  placeholder="Select communities"
                  searchPlaceholder="Search communities"
                  emptyText="No communities found."
                  ariaLabelledBy="gig-candidate-communities-label"
                  isRequired
                  isInvalid={fieldState.invalid}
                  triggerRef={field.ref}
                  onBlur={field.onBlur}
                  onValueChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="countryIso"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    id="gig-candidate-country-label"
                    htmlFor="gig-candidate-country"
                  >
                    Country:{gigCandidate ? null : <RequiredIndicator />}
                  </FieldLabel>
                  <SearchableSelect
                    id="gig-candidate-country"
                    name={field.name}
                    value={field.value}
                    options={countryOptions}
                    placeholder="Select country"
                    searchPlaceholder="Search countries"
                    emptyText="No countries found."
                    ariaLabelledBy="gig-candidate-country-label"
                    isRequired={!gigCandidate}
                    isInvalid={fieldState.invalid}
                    triggerRef={field.ref}
                    onBlur={field.onBlur}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('localityId', '');
                      form.setValue('venueIds', []);
                    }}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="localityId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    id="gig-candidate-locality-label"
                    htmlFor="gig-candidate-locality"
                  >
                    Locality:{gigCandidate ? null : <RequiredIndicator />}
                  </FieldLabel>
                  <SearchableSelect
                    id="gig-candidate-locality"
                    name={field.name}
                    value={field.value}
                    options={localityOptions}
                    placeholder={
                      localitiesQuery.isPending ? 'Loading localities…' : 'Select locality'
                    }
                    searchPlaceholder="Search localities"
                    emptyText="No localities found."
                    ariaLabelledBy="gig-candidate-locality-label"
                    isDisabled={countryIso.length === 0 || localitiesQuery.isPending}
                    isRequired={!gigCandidate}
                    isInvalid={fieldState.invalid || localitiesQuery.isError}
                    triggerRef={field.ref}
                    onBlur={field.onBlur}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('venueIds', []);
                    }}
                  />
                  <FieldError errors={[fieldState.error]} />
                  {localitiesQuery.isError ? (
                    <p className="text-sm text-destructive">Could not load localities.</p>
                  ) : null}
                </Field>
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <FieldSeparator className="flex-1" />
              <Button
                type="button"
                variant="secondary"
                disabled={isLookingUp || saveMutation.isPending || localityId.length === 0}
                onClick={() => {
                  void lookupGigCandidateDraft();
                }}
              >
                {isLookingUp ? 'Looking up…' : 'Find info with AI'}
              </Button>
              <FieldSeparator className="flex-1" />
            </div>
            {locationHintText.length > 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                AI suggested location: {locationHintText}
              </p>
            ) : null}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <Field
                  className="min-w-0"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="gig-candidate-date">
                    Date:{gigCandidate ? null : <RequiredIndicator />}
                  </FieldLabel>
                  <DateInput
                    {...field}
                    id="gig-candidate-date"
                    required={!gigCandidate}
                    clearLabel="Clear Date"
                    onClear={() => field.onChange('')}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="endDate"
              render={({ field, fieldState }) => (
                <Field
                  className="min-w-0"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="gig-candidate-end-date">End Date:</FieldLabel>
                  <DateInput
                    {...field}
                    id="gig-candidate-end-date"
                    clearLabel="Clear End Date"
                    onClear={() => field.onChange('')}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="venueIds"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  id="gig-candidate-venues-label"
                  htmlFor="gig-candidate-venues"
                >
                  Venues:
                </FieldLabel>
                <SearchableSelect
                  id="gig-candidate-venues"
                  name={field.name}
                  selectionMode="multiple"
                  value={field.value}
                  options={venueOptions}
                  placeholder={
                    localityId.length === 0
                      ? 'Select a locality first'
                      : venuesQuery.isPending
                        ? 'Loading venues…'
                        : 'Select venues'
                  }
                  searchPlaceholder="Search venues"
                  emptyText="No venues found."
                  ariaLabelledBy="gig-candidate-venues-label"
                  isDisabled={localityId.length === 0 || venuesQuery.isPending}
                  isInvalid={fieldState.invalid || venuesQuery.isError}
                  triggerRef={field.ref}
                  onBlur={field.onBlur}
                  onValueChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
                {venuesQuery.isError ? (
                  <p className="text-sm text-destructive">Could not load venues.</p>
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="ticketsUrl"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="gig-candidate-tickets-url">Tickets URL:</FieldLabel>
                <Input
                  {...field}
                  id="gig-candidate-tickets-url"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. https://www.ticketmaster.es/event/..."
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <PosterField
            variant={gigCandidate ? 'edit' : 'create'}
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
