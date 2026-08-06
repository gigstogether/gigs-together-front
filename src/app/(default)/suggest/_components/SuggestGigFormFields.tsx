'use client';

import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { defaultSuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import type { SuggestGigFormValues } from '@/app/(default)/suggest/_lib/suggest-form.shared';
import { countryIsoToTranslationKey } from '@/lib/i18n/country-iso-to-translation-key';
import type { Country } from '@/lib/api-boundary-schemas';
import { useT } from '@/providers/I18nProvider';

interface SuggestGigFormFieldsProps {
  form: UseFormReturn<SuggestGigFormValues>;
  countries: Country[];
}

export default function SuggestGigFormFields(props: SuggestGigFormFieldsProps) {
  const { form, countries } = props;

  const t = useT();

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
            </FieldLabel>
            <Input
              {...field}
              id="suggest-gig-title"
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
              </FieldLabel>
              <select
                {...field}
                id="suggest-gig-country"
                aria-labelledby="suggest-gig-country-label"
                aria-invalid={fieldState.invalid}
                value={field.value ?? defaultSuggestGigFormValues.country}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
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
              <FieldLabel
                id="suggest-gig-city-label"
                htmlFor="suggest-gig-city"
              >
                City:
              </FieldLabel>
              <Input
                {...field}
                id="suggest-gig-city"
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

      <Controller
        control={form.control}
        name="date"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              id="suggest-gig-date-label"
              htmlFor="suggest-gig-date"
            >
              Date:
            </FieldLabel>
            <Input
              {...field}
              id="suggest-gig-date"
              type="date"
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
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              id="suggest-gig-end-date-label"
              htmlFor="suggest-gig-end-date"
            >
              End Date: (optional)
            </FieldLabel>
            <Input
              {...field}
              id="suggest-gig-end-date"
              type="date"
              aria-labelledby="suggest-gig-end-date-label"
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
