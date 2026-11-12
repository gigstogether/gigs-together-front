'use client';

import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import DateInput from '@/components/DateInput';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/Select';
import { GIG_TITLE_MAX_LENGTH } from '@/lib/gig.constants';
import { defaultSuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import type { SuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import type { CountryDisplayOption } from '@/lib/i18n/country-display-name';

interface SuggestGigFormFieldsProps {
  form: UseFormReturn<SuggestGigFormValues>;
  countries: CountryDisplayOption[];
}

export default function SuggestGigFormFields(props: SuggestGigFormFieldsProps) {
  const { form, countries } = props;

  const countryOptions = countries.map((country) => ({
    value: country.iso,
    label: country.name,
  }));

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
              <span
                aria-hidden="true"
                className="text-destructive"
              >
                *
              </span>
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
          name="country"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                id="suggest-gig-country-label"
                htmlFor="suggest-gig-country"
              >
                Country:
                <span
                  aria-hidden="true"
                  className="text-destructive"
                >
                  *
                </span>
              </FieldLabel>
              <Select
                id="suggest-gig-country"
                name={field.name}
                value={field.value ?? defaultSuggestGigFormValues.country}
                options={countryOptions}
                placeholder="Select country"
                ariaLabelledBy="suggest-gig-country-label"
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

        <Controller
          control={form.control}
          name="city"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                id="suggest-gig-city-label"
                htmlFor="suggest-gig-city"
              >
                City:
                <span
                  aria-hidden="true"
                  className="text-destructive"
                >
                  *
                </span>
              </FieldLabel>
              <Input
                {...field}
                id="suggest-gig-city"
                required
                aria-labelledby="suggest-gig-city-label"
                aria-invalid={fieldState.invalid}
                placeholder="e.g. Barcelona"
                value={field.value ?? ''}
              />
              <FieldError errors={[fieldState.error]} />
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
                <span
                  aria-hidden="true"
                  className="text-destructive"
                >
                  *
                </span>
              </FieldLabel>
              <DateInput
                {...field}
                id="suggest-gig-date"
                required
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
                End Date: (optional)
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
        name="venue"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              id="suggest-gig-venue-label"
              htmlFor="suggest-gig-venue"
            >
              Venue: (optional)
            </FieldLabel>
            <Input
              {...field}
              id="suggest-gig-venue"
              aria-labelledby="suggest-gig-venue-label"
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
            <FieldLabel
              id="suggest-gig-tickets-url-label"
              htmlFor="suggest-gig-tickets-url"
            >
              Tickets URL: (optional)
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
