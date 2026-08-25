'use client';

import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import { defaultGigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import type { Country } from '@/lib/api-boundary-schemas';
import { countryIsoToTranslationKey } from '@/lib/i18n/country-iso-to-translation-key';
import { useT } from '@/providers/I18nProvider';

interface GigFormFieldsProps {
  form: UseFormReturn<GigFormValues>;
  countries: Country[];
  isSubmitting: boolean;
  isLoading?: boolean;
  allowEmptyCountry?: boolean;
  isLookingUp?: boolean;
  onLookup?: () => Promise<void>;
}

export default function GigFormFields(props: GigFormFieldsProps) {
  const {
    form,
    countries,
    isSubmitting,
    isLoading,
    allowEmptyCountry = false,
    isLookingUp = false,
    onLookup,
  } = props;

  const t = useT();

  return (
    <>
      <Controller
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="gig-title">Title:</FieldLabel>
            <Input
              {...field}
              id="gig-title"
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
          name="country"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="gig-country">Country:</FieldLabel>
              <select
                {...field}
                id="gig-country"
                aria-invalid={fieldState.invalid}
                value={field.value ?? defaultGigFormValues.country}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                {allowEmptyCountry ? <option value="">Not set</option> : null}
                {countries.map((country) => (
                  <option
                    key={country.iso}
                    value={country.iso}
                  >
                    {t('country', countryIsoToTranslationKey(country.iso))}
                  </option>
                ))}
              </select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="city"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="gig-city">City:</FieldLabel>
              <Input
                {...field}
                id="gig-city"
                aria-invalid={fieldState.invalid}
                placeholder="e.g. Barcelona"
                value={field.value ?? ''}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>

      {onLookup ? (
        <div className="flex items-center gap-3">
          <FieldSeparator className="flex-1" />
          <Button
            type="button"
            variant="secondary"
            disabled={isLookingUp || isSubmitting || !!isLoading}
            onClick={() => {
              void onLookup();
            }}
          >
            {isLookingUp ? 'Looking up...' : 'Find info with AI'}
          </Button>
          <FieldSeparator className="flex-1" />
        </div>
      ) : null}

      <div className="grid min-w-0 grid-cols-2 gap-4">
        <Controller
          control={form.control}
          name="date"
          render={({ field, fieldState }) => (
            <Field
              className="min-w-0"
              data-invalid={fieldState.invalid}
            >
              <FieldLabel htmlFor="gig-date">Date:</FieldLabel>
              <Input
                {...field}
                id="gig-date"
                type="date"
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
              <FieldLabel htmlFor="gig-end-date">End Date: (optional)</FieldLabel>
              <Input
                {...field}
                id="gig-end-date"
                type="date"
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
        name="venue"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="gig-venue">Venue:</FieldLabel>
            <Input
              {...field}
              id="gig-venue"
              aria-invalid={fieldState.invalid}
              placeholder="e.g. Razzmatazz"
              value={field.value ?? ''}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="ticketsUrl"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="gig-tickets-url">Tickets URL:</FieldLabel>
            <Input
              {...field}
              id="gig-tickets-url"
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
