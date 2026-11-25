'use client';

import { Controller, useWatch } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import DateInput from '@/components/DateInput';
import { Input } from '@/components/ui/input';
import RequiredIndicator from '@/components/RequiredIndicator';
import { SearchableSelect } from '@/components/SearchableSelect';
import { GIG_TITLE_MAX_LENGTH } from '@/lib/gig.constants';
import type {
  SuggestCommunityOption,
  SuggestGigFormValues,
} from '@/app/(default)/suggest/_lib/suggest-form.shared';
import {
  fetchPublicLocalities,
  fetchPublicVenues,
  formatLocalityName,
} from '@/app/(default)/suggest/_lib/location-catalog-api';
import type { CountryDisplayOption } from '@/lib/i18n/country-display-name';

interface SuggestGigFormFieldsProps {
  form: UseFormReturn<SuggestGigFormValues>;
  communityOptions: SuggestCommunityOption[];
  countries: CountryDisplayOption[];
}

export default function SuggestGigFormFields(props: SuggestGigFormFieldsProps) {
  const { form, communityOptions, countries } = props;

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
    enabled: localityId.length > 0,
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

  return (
    <>
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

      <Controller
        control={form.control}
        name="communityId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              id="suggest-gig-community-label"
              htmlFor="suggest-gig-community"
            >
              Community:
              <RequiredIndicator />
            </FieldLabel>
            <SearchableSelect
              id="suggest-gig-community"
              name={field.name}
              value={field.value}
              options={communityOptions}
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
                Locality:
                <RequiredIndicator />
              </FieldLabel>
              <SearchableSelect
                id="suggest-gig-locality"
                name={field.name}
                value={field.value}
                options={localityOptions}
                placeholder={localitiesQuery.isPending ? 'Loading localities…' : 'Select locality'}
                searchPlaceholder="Search localities"
                emptyText="No localities found."
                ariaLabelledBy="suggest-gig-locality-label"
                isDisabled={countryIso.length === 0 || localitiesQuery.isPending}
                isRequired
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

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <Controller
        control={form.control}
        name="venueIds"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              id="suggest-gig-venue-label"
              htmlFor="suggest-gig-venue"
            >
              Venues:
            </FieldLabel>
            <SearchableSelect
              id="suggest-gig-venue"
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
              ariaLabelledBy="suggest-gig-venue-label"
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
    </>
  );
}
