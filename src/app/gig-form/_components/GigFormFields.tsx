'use client';

import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';
import { defaultGigFormValues } from '@/app/gig-form/gig-form.shared';
import type { Country } from '@/lib/countries.server';
import { useT } from '@/lib/i18n';

interface GigFormFieldsProps {
  form: UseFormReturn<GigFormValues>;
  countries: Country[];
  isLookingUp: boolean;
  isSubmitting: boolean;
  isLoading?: boolean;
  onLookup: () => void;
}

export default function GigFormFields(props: GigFormFieldsProps) {
  const { form, countries, isLookingUp, isSubmitting, isLoading, onLookup } = props;

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
                {countries.map((country) => (
                  <option key={country.iso} value={country.iso}>
                    {t('country', country.iso)}
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

      <div className="flex items-center gap-3">
        <FieldSeparator className="flex-1" />
        <Button
          type="button"
          variant="secondary"
          disabled={isLookingUp || isSubmitting || !!isLoading}
          onClick={onLookup}
        >
          {isLookingUp ? 'Looking up...' : 'Find info with AI'}
        </Button>
        <FieldSeparator className="flex-1" />
      </div>

      <Controller
        control={form.control}
        name="date"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
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
          <Field data-invalid={fieldState.invalid}>
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
