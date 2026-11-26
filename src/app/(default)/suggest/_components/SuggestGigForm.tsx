import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';

import { useSuggestGigSubmit } from '@/app/(default)/suggest/_hooks/use-suggest-gig-submit';
import {
  fetchPublicLocalities,
  fetchPublicVenues,
  formatLocalityName,
} from '@/app/(default)/suggest/_lib/location-catalog-api';
import { suggestGigFormSchema } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import type { SuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import DateInput from '@/components/DateInput';
import RequiredIndicator from '@/components/RequiredIndicator';
import PosterField from '@/components/PosterField';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import type { CommunityDisplayOption } from '@/lib/community/community-display-option';
import { GIG_TITLE_MAX_LENGTH } from '@/lib/gig.constants';
import type { CountryDisplayOption } from '@/lib/i18n/country-display-name';
import { cn } from '@/lib/utils';

interface SuggestGigFormProps {
  initialCommunityId: string;
  communityOptions: CommunityDisplayOption[];
  countries: CountryDisplayOption[];
  description?: string;
}

function createDefaultSuggestGigFormValues(communityId: string): SuggestGigFormValues {
  return {
    communityId,
    countryIso: 'ES',
    localityId: '',
    venueIds: [],
    title: '',
    date: '',
    endDate: '',
    ticketsUrl: '',
  };
}

export default function SuggestGigForm(props: SuggestGigFormProps) {
  const { initialCommunityId, communityOptions, countries, description } = props;

  const defaultValues = createDefaultSuggestGigFormValues(initialCommunityId);

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAdditionalInfoExpanded, setIsAdditionalInfoExpanded] = useState(false);
  const [isEndDateEnabled, setIsEndDateEnabled] = useState(false);
  const [isAddingVenue, setIsAddingVenue] = useState(false);
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<SuggestGigFormValues>({
    resolver: zodResolver(suggestGigFormSchema),
    defaultValues,
  });

  const countryOptions = countries.map((country) => ({
    value: country.iso,
    label: country.name,
  }));
  const countryIso = useWatch({ control: form.control, name: 'countryIso' });
  const localityId = useWatch({ control: form.control, name: 'localityId' });
  const localitiesQuery = useQuery({
    queryKey: ['public', 'localities', countryIso],
    queryFn: () => fetchPublicLocalities(countryIso),
    enabled: countryIso.length > 0,
  });
  const venuesQuery = useQuery({
    queryKey: ['public', 'venues', localityId],
    queryFn: () => fetchPublicVenues(localityId),
    enabled: isAdditionalInfoExpanded && localityId.length > 0,
  });
  const localityOptions =
    localitiesQuery.data?.localities.map((locality) => ({
      value: locality.id,
      label: formatLocalityName(locality),
    })) ?? [];
  const venueOptions =
    venuesQuery.data?.venues.map((venue) => ({
      value: venue.id,
      label: venue.name,
    })) ?? [];
  const DetailsIcon = isAdditionalInfoExpanded ? Minus : Plus;

  const { isSubmitting, onSubmit } = useSuggestGigSubmit({
    posterFile,
    posterUrl,
    onSuccess: () => {
      toast({
        title: 'Sent!',
        description: "Thanks — we'll review your suggestion soon.",
      });
      setIsSubmitted(true);
      setIsAdditionalInfoExpanded(false);
      setIsEndDateEnabled(false);
      setIsAddingVenue(false);
      form.reset(createDefaultSuggestGigFormValues(form.getValues('communityId')));
      setPosterFile(null);
      setPosterUrl('');
      if (posterFileInputRef.current) {
        posterFileInputRef.current.value = '';
      }
    },
  });

  function handleInvalidSubmit(errors: FieldErrors<SuggestGigFormValues>): void {
    const hasAdditionalFieldErrors =
      errors.date !== undefined ||
      errors.endDate !== undefined ||
      errors.venueIds !== undefined ||
      errors.ticketsUrl !== undefined;

    if (hasAdditionalFieldErrors) {
      setIsAdditionalInfoExpanded(true);
    }
  }

  async function handleEndDateToggle(isEnabled: boolean): Promise<void> {
    setIsEndDateEnabled(isEnabled);
    if (!isEnabled) {
      form.resetField('endDate');
      await form.trigger(['date', 'endDate']);
    }
  }

  function clearPoster() {
    setPosterFile(null);
    setPosterUrl('');
    if (posterFileInputRef.current) {
      posterFileInputRef.current.value = '';
    }
  }

  if (isSubmitted) {
    return (
      <Card className="mx-auto flex min-h-0 max-h-full w-full flex-col rounded-none border-0 shadow-none sm:max-w-md sm:rounded-xl sm:shadow">
        <div className="min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-[inherit] [scrollbar-gutter:stable_both-edges]">
          <CardHeader className="px-6 sm:px-2">
            <CardTitle>Suggestion received</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 sm:px-2">
            <p className="text-sm text-muted-foreground">
              Your gig is in the review queue. You can suggest another one if you want.
            </p>
            <Button
              type="button"
              onClick={() => setIsSubmitted(false)}
            >
              Suggest another
            </Button>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto flex min-h-0 max-h-full w-full flex-col rounded-none border-0 shadow-none sm:max-w-md sm:rounded-xl sm:shadow">
      <form
        onSubmit={form.handleSubmit(onSubmit, handleInvalidSubmit)}
        aria-labelledby="suggest-gig-heading"
        aria-describedby={description ? 'suggest-gig-description' : undefined}
        className="flex min-h-0 flex-col overflow-clip rounded-[inherit]"
      >
        <div className="min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-gutter:stable_both-edges]">
          <CardHeader className="px-6 sm:px-2">
            <Controller
              control={form.control}
              name="communityId"
              render={({ field, fieldState }) => (
                <div>
                  <CardTitle className="flex flex-wrap items-baseline gap-x-1 text-base font-semibold leading-normal text-foreground">
                    <h1
                      id="suggest-gig-heading"
                      className="text-base font-semibold text-foreground"
                    >
                      Suggest a gig
                    </h1>
                    <div className="inline-flex min-w-0 max-w-full items-baseline gap-x-1">
                      <span className="shrink-0">for the</span>
                      <span
                        id="suggest-gig-community-label"
                        className="sr-only"
                      >
                        Community
                      </span>
                      <SearchableSelect
                        id="suggest-gig-community"
                        name={field.name}
                        value={field.value}
                        options={communityOptions}
                        variant="inline"
                        className="font-semibold"
                        title="Change community"
                        placeholder="Select community"
                        searchPlaceholder="Search communities"
                        emptyText="No communities found."
                        ariaLabelledBy="suggest-gig-community-label"
                        isRequired
                        isInvalid={fieldState.invalid}
                        triggerRef={field.ref}
                        onBlur={field.onBlur}
                        onValueChange={field.onChange}
                      />
                      <span className="shrink-0">community</span>
                    </div>
                  </CardTitle>
                  <FieldError errors={[fieldState.error]} />
                </div>
              )}
            />
            {description ? (
              <CardDescription
                id="suggest-gig-description"
                className="text-sm"
              >
                {description}
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-6 px-6 sm:px-2">
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    id="suggest-gig-title-label"
                    htmlFor="suggest-gig-title"
                  >
                    Title:
                    <RequiredIndicator />
                  </FieldLabel>
                  <Input
                    {...field}
                    id="suggest-gig-title"
                    required
                    maxLength={GIG_TITLE_MAX_LENGTH}
                    aria-labelledby="suggest-gig-title-label"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Arctic Monkeys"
                    value={field.value ?? ''}
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
                      id="suggest-gig-country-label"
                      htmlFor="suggest-gig-country"
                    >
                      Country:
                      <RequiredIndicator />
                    </FieldLabel>
                    <SearchableSelect
                      id="suggest-gig-country"
                      name={field.name}
                      value={field.value}
                      options={countryOptions}
                      placeholder="Select country"
                      searchPlaceholder="Search countries"
                      emptyText="No countries found."
                      ariaLabelledBy="suggest-gig-country-label"
                      isRequired
                      isInvalid={fieldState.invalid}
                      triggerRef={field.ref}
                      onBlur={field.onBlur}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('localityId', '');
                        form.setValue('venueIds', []);
                        setIsAddingVenue(false);
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
                      id="suggest-gig-locality-label"
                      htmlFor="suggest-gig-locality"
                    >
                      City / area:
                      <RequiredIndicator />
                    </FieldLabel>
                    <SearchableSelect
                      id="suggest-gig-locality"
                      name={field.name}
                      value={field.value}
                      options={localityOptions}
                      placeholder={
                        localitiesQuery.isPending
                          ? 'Loading cities and areas…'
                          : 'Select a city or area'
                      }
                      searchPlaceholder="Search cities and areas"
                      emptyText="No cities or areas found."
                      ariaLabelledBy="suggest-gig-locality-label"
                      isDisabled={countryIso.length === 0 || localitiesQuery.isPending}
                      isRequired
                      isInvalid={fieldState.invalid || localitiesQuery.isError}
                      triggerRef={field.ref}
                      onBlur={field.onBlur}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('venueIds', []);
                        setIsAddingVenue(false);
                      }}
                    />
                    <FieldError errors={[fieldState.error]} />
                    {localitiesQuery.isError ? (
                      <p className="text-sm text-destructive">Could not load cities and areas.</p>
                    ) : null}
                  </Field>
                )}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-auto max-w-full justify-start gap-2.5 whitespace-normal px-0 py-2 text-left font-normal hover:bg-transparent"
              aria-expanded={isAdditionalInfoExpanded}
              aria-controls="suggest-gig-additional-fields"
              aria-labelledby="suggest-gig-additional-details-label"
              aria-describedby={
                isAdditionalInfoExpanded ? undefined : 'suggest-gig-additional-details-hint'
              }
              onClick={() => setIsAdditionalInfoExpanded((isExpanded) => !isExpanded)}
            >
              <DetailsIcon
                className="mt-0.5 size-4 shrink-0 self-start text-muted-foreground"
                aria-hidden
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span
                  id="suggest-gig-additional-details-label"
                  className="text-sm text-foreground"
                >
                  {isAdditionalInfoExpanded ? 'Hide details' : 'Add details'}
                </span>
                {!isAdditionalInfoExpanded ? (
                  <span
                    id="suggest-gig-additional-details-hint"
                    className="text-sm text-muted-foreground"
                  >
                    Date, venue, tickets or a poster
                  </span>
                ) : null}
              </span>
            </Button>
            {/* Keep this section mounted while collapsed to preserve values and the poster; disable hidden controls to avoid native validation. */}
            <fieldset
              id="suggest-gig-additional-fields"
              aria-label="Additional gig details"
              hidden={!isAdditionalInfoExpanded}
              disabled={!isAdditionalInfoExpanded}
              className="min-w-0 space-y-6"
            >
              <div className="space-y-3">
                <div
                  className={cn(
                    'grid min-w-0 grid-cols-1 gap-4',
                    isEndDateEnabled && 'grid-cols-2',
                  )}
                >
                  <Controller
                    control={form.control}
                    name="date"
                    render={({ field, fieldState }) => (
                      <Field
                        className="min-w-0"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel
                          id="suggest-gig-date-label"
                          htmlFor="suggest-gig-date"
                        >
                          Date:
                        </FieldLabel>
                        <DateInput
                          {...field}
                          id="suggest-gig-date"
                          clearLabel="Clear Date"
                          onClear={() => field.onChange('')}
                          aria-labelledby="suggest-gig-date-label"
                          aria-invalid={fieldState.invalid}
                          value={field.value ?? ''}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  {isEndDateEnabled ? (
                    <Controller
                      control={form.control}
                      name="endDate"
                      render={({ field, fieldState }) => (
                        <Field
                          className="min-w-0"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel
                            id="suggest-gig-end-date-label"
                            htmlFor="suggest-gig-end-date"
                          >
                            End Date:
                          </FieldLabel>
                          <DateInput
                            {...field}
                            id="suggest-gig-end-date"
                            clearLabel="Clear End Date"
                            onClear={() => field.onChange('')}
                            aria-labelledby="suggest-gig-end-date-label"
                            aria-invalid={fieldState.invalid}
                            value={field.value ?? ''}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <FieldLabel
                    htmlFor="suggest-gig-multiple-days"
                    className="font-normal text-muted-foreground"
                  >
                    Multi-day event
                  </FieldLabel>
                  <Switch
                    id="suggest-gig-multiple-days"
                    checked={isEndDateEnabled}
                    onCheckedChange={handleEndDateToggle}
                  />
                </div>
              </div>

              <Controller
                control={form.control}
                name="venueIds"
                render={({ field, fieldState }) => {
                  const venueIds = field.value.length === 0 ? [''] : [...field.value];
                  if (isAddingVenue && field.value.length > 0) {
                    venueIds.push('');
                  }
                  const canAddVenue =
                    field.value.length > 0 &&
                    !isAddingVenue &&
                    venueOptions.some((option) => !field.value.includes(option.value));

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        id="suggest-gig-venue-label"
                        htmlFor="suggest-gig-venue"
                      >
                        Venue:
                      </FieldLabel>
                      <div className="space-y-3">
                        {venueIds.map((venueId, index) => {
                          const inputId =
                            index === 0 ? 'suggest-gig-venue' : `suggest-gig-venue-${index + 1}`;
                          const labelId = `${inputId}-label`;
                          const options = venueOptions.filter(
                            (option) =>
                              option.value === venueId || !field.value.includes(option.value),
                          );

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              {index > 0 ? (
                                <span
                                  id={labelId}
                                  className="sr-only"
                                >
                                  Venue {index + 1}
                                </span>
                              ) : null}
                              <SearchableSelect
                                id={inputId}
                                name={field.name}
                                value={venueId}
                                options={options}
                                placeholder={
                                  localityId.length === 0
                                    ? 'Select a city or area first'
                                    : venuesQuery.isPending
                                      ? 'Loading venues…'
                                      : 'Select a venue'
                                }
                                searchPlaceholder="Search venues"
                                emptyText="No venues found."
                                ariaLabelledBy={labelId}
                                isDisabled={localityId.length === 0 || venuesQuery.isPending}
                                isInvalid={fieldState.invalid || venuesQuery.isError}
                                triggerRef={index === 0 ? field.ref : undefined}
                                onBlur={field.onBlur}
                                onValueChange={(value) => {
                                  const nextVenueIds = [...field.value];
                                  nextVenueIds[index] = value;
                                  field.onChange(nextVenueIds);
                                  if (index === field.value.length) {
                                    setIsAddingVenue(false);
                                  }
                                }}
                              />
                              {venueId.length > 0 || isAddingVenue ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                                  aria-label={`Remove venue ${index + 1}`}
                                  onClick={() => {
                                    if (venueId.length > 0) {
                                      field.onChange(
                                        field.value.filter((_, venueIndex) => venueIndex !== index),
                                      );
                                    }
                                    if (venueId.length === 0 || field.value.length === 1) {
                                      setIsAddingVenue(false);
                                    }
                                  }}
                                >
                                  <X
                                    className="size-4"
                                    aria-hidden
                                  />
                                </Button>
                              ) : null}
                            </div>
                          );
                        })}
                        {canAddVenue ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-auto justify-start gap-2 px-0 py-1 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
                            onClick={() => setIsAddingVenue(true)}
                          >
                            <Plus
                              className="size-4"
                              aria-hidden
                            />
                            Add another venue
                          </Button>
                        ) : null}
                      </div>
                      <FieldError errors={[fieldState.error]} />
                      {venuesQuery.isError ? (
                        <p className="text-sm text-destructive">Could not load venues.</p>
                      ) : null}
                    </Field>
                  );
                }}
              />

              <Controller
                control={form.control}
                name="ticketsUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      id="suggest-gig-tickets-url-label"
                      htmlFor="suggest-gig-tickets-url"
                    >
                      Tickets URL:
                    </FieldLabel>
                    <Input
                      {...field}
                      id="suggest-gig-tickets-url"
                      aria-labelledby="suggest-gig-tickets-url-label"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. https://www.ticketmaster.es/event/..."
                      value={field.value ?? ''}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <PosterField
                posterFile={posterFile}
                onPosterFileChange={setPosterFile}
                posterUrl={posterUrl}
                onPosterUrlChange={setPosterUrl}
                onClearPoster={clearPoster}
                posterFileInputRef={posterFileInputRef}
                isUrlInputEnabled={false}
              />
            </fieldset>
          </CardContent>
        </div>
        <div className="shrink-0 overflow-hidden border-t bg-card px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] [scrollbar-gutter:stable_both-edges] sm:px-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting…' : 'Submit suggestion'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
