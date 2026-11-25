'use client';

import { Controller, useWatch } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import DateInput from '@/components/DateInput';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import RequiredIndicator from '@/components/RequiredIndicator';
import { SearchableSelect } from '@/components/SearchableSelect';
import type { GigFormValues } from '@/app/admin/gigs/_lib/gig-form.shared';
import type { CountryDisplayOption } from '@/lib/i18n/country-display-name';
import { GIG_TITLE_MAX_LENGTH } from '@/lib/gig.constants';
import type { CommunityDisplayOption } from '@/lib/community/community-display-option';
import { useAdminLocationCatalog } from '@/app/admin/_hooks/useAdminLocationCatalog';

interface GigFormFieldsProps {
  form: UseFormReturn<GigFormValues>;
  countries: CountryDisplayOption[];
  communityOptions: CommunityDisplayOption[];
  isSubmitting: boolean;
  isLoading?: boolean;
}

export default function GigFormFields(props: GigFormFieldsProps) {
  const { form, countries, communityOptions, isSubmitting, isLoading } = props;

  const countryIso = useWatch({ control: form.control, name: 'countryIso' });
  const localityId = useWatch({ control: form.control, name: 'localityId' });
  const selectedVenueIds = useWatch({ control: form.control, name: 'venueIds' });
  const { localitiesQuery, venuesQuery, countryOptions, localityOptions, venueOptions } =
    useAdminLocationCatalog({
      countries,
      countryIso,
      localityId,
      selectedVenueIds,
    });

  return (
    <>
      <Controller
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="gig-title">
              Title:
              <RequiredIndicator />
            </FieldLabel>
            <Input
              {...field}
              id="gig-title"
              required
              maxLength={GIG_TITLE_MAX_LENGTH}
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
        name="communityIds"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              id="gig-communities-label"
              htmlFor="gig-communities"
            >
              Communities:
              <RequiredIndicator />
            </FieldLabel>
            <SearchableSelect
              id="gig-communities"
              name={field.name}
              selectionMode="multiple"
              value={field.value}
              options={communityOptions}
              placeholder="Select communities"
              searchPlaceholder="Search communities"
              emptyText="No communities found."
              ariaLabelledBy="gig-communities-label"
              isRequired
              isDisabled={isSubmitting || Boolean(isLoading)}
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
                id="gig-country-label"
                htmlFor="gig-country"
              >
                Country:
                <RequiredIndicator />
              </FieldLabel>
              <SearchableSelect
                id="gig-country"
                name={field.name}
                value={field.value}
                options={countryOptions}
                placeholder="Select country"
                searchPlaceholder="Search countries"
                emptyText="No countries found."
                ariaLabelledBy="gig-country-label"
                isRequired
                isDisabled={isSubmitting || Boolean(isLoading)}
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
                id="gig-locality-label"
                htmlFor="gig-locality"
              >
                Locality:
                <RequiredIndicator />
              </FieldLabel>
              <SearchableSelect
                id="gig-locality"
                name={field.name}
                value={field.value}
                options={localityOptions}
                placeholder={localitiesQuery.isPending ? 'Loading localities…' : 'Select locality'}
                searchPlaceholder="Search localities"
                emptyText="No localities found."
                ariaLabelledBy="gig-locality-label"
                isDisabled={
                  isSubmitting ||
                  Boolean(isLoading) ||
                  countryIso.length === 0 ||
                  localitiesQuery.isPending
                }
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
              <FieldLabel htmlFor="gig-date">
                Date:
                <RequiredIndicator />
              </FieldLabel>
              <DateInput
                {...field}
                id="gig-date"
                required
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
              <FieldLabel htmlFor="gig-end-date">End Date:</FieldLabel>
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
        name="venueIds"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              id="gig-venues-label"
              htmlFor="gig-venues"
            >
              Venues:
              <RequiredIndicator />
            </FieldLabel>
            <SearchableSelect
              id="gig-venues"
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
              ariaLabelledBy="gig-venues-label"
              isDisabled={
                isSubmitting ||
                Boolean(isLoading) ||
                localityId.length === 0 ||
                venuesQuery.isPending
              }
              isRequired
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
            <FieldLabel htmlFor="gig-tickets-url">
              Tickets URL:
              <RequiredIndicator />
            </FieldLabel>
            <Input
              {...field}
              id="gig-tickets-url"
              required
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
