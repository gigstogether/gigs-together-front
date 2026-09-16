'use client';

import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import DateInput from '@/components/DateInput';
import { Field, FieldError, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import NativeSelect from '@/components/NativeSelect';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import { defaultGigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import type { Country } from '@/lib/api-boundary-schemas';
import { GIG_TITLE_MAX_LENGTH } from '@/lib/gig.constants';
import { countryIsoToTranslationKey } from '@/lib/i18n/country-iso-to-translation-key';
import { useT } from '@/providers/I18nProvider';

interface GigFormFieldsProps {
  form: UseFormReturn<GigFormValues>;
  countries: Country[];
  isSubmitting: boolean;
  validationMode: 'completeGig' | 'candidateCreate' | 'candidateDraft';
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
    validationMode,
    isLoading,
    allowEmptyCountry = false,
    isLookingUp = false,
    onLookup,
  } = props;

  const t = useT();
  const isCompleteGig = validationMode === 'completeGig';
  const areCoreFieldsRequired = validationMode !== 'candidateDraft';
  const coreRequiredIndicator = areCoreFieldsRequired ? (
    <span
      aria-hidden="true"
      className="text-destructive"
    >
      *
    </span>
  ) : null;
  const completeGigRequiredIndicator = isCompleteGig ? coreRequiredIndicator : null;

  return (
    <>
      <Controller
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="gig-title">Title:{coreRequiredIndicator}</FieldLabel>
            <Input
              {...field}
              id="gig-title"
              required={areCoreFieldsRequired}
              maxLength={GIG_TITLE_MAX_LENGTH}
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
              <FieldLabel htmlFor="gig-country">Country:{coreRequiredIndicator}</FieldLabel>
              <NativeSelect
                {...field}
                id="gig-country"
                required={areCoreFieldsRequired}
                aria-invalid={fieldState.invalid}
                value={field.value ?? defaultGigFormValues.country}
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
              </NativeSelect>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="city"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="gig-city">City:{coreRequiredIndicator}</FieldLabel>
              <Input
                {...field}
                id="gig-city"
                required={areCoreFieldsRequired}
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

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="date"
          render={({ field, fieldState }) => (
            <Field
              className="min-w-0"
              data-invalid={fieldState.invalid}
            >
              <FieldLabel htmlFor="gig-date">Date:{coreRequiredIndicator}</FieldLabel>
              <DateInput
                {...field}
                id="gig-date"
                required={areCoreFieldsRequired}
                clearLabel="Clear Date"
                onClear={() => field.onChange('')}
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
              <DateInput
                {...field}
                id="gig-end-date"
                clearLabel="Clear End Date"
                onClear={() => field.onChange('')}
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
            <FieldLabel htmlFor="gig-venue">Venue:{completeGigRequiredIndicator}</FieldLabel>
            <Input
              {...field}
              id="gig-venue"
              required={isCompleteGig}
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
            <FieldLabel htmlFor="gig-tickets-url">
              Tickets URL:{completeGigRequiredIndicator}
            </FieldLabel>
            <Input
              {...field}
              id="gig-tickets-url"
              required={isCompleteGig}
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
