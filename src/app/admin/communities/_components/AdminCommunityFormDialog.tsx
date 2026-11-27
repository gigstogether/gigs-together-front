'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { AdminCommunity, AdminCommunityBody } from '../_lib/admin-communities-api';
import type { Country } from '@/lib/api-boundary-schemas';
import { getCountryDisplayName } from '@/lib/i18n/country-display-name';
import { SearchableSelect } from '@/components/SearchableSelect';
import RequiredIndicator from '@/components/RequiredIndicator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export interface CommunityNameOption {
  value: string;
  label: string;
}

interface AdminCommunityFormDialogProps {
  value: AdminCommunity | null;
  countries: Country[];
  nameOptions: CommunityNameOption[];
  isSaving: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (body: AdminCommunityBody) => Promise<void>;
}

export default function AdminCommunityFormDialog(props: AdminCommunityFormDialogProps) {
  const { value, countries, nameOptions, isSaving, onOpenChange, onSubmit } = props;

  const [countryIso, setCountryIso] = useState(value?.countryIso ?? '');
  const [slug, setSlug] = useState(value?.slug ?? '');
  const [nameTranslationKey, setNameTranslationKey] = useState(value?.nameTranslationKey ?? '');
  const [timeZone, setTimeZone] = useState(value?.timeZone ?? '');
  const [isActive, setIsActive] = useState(value?.isActive ?? true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const countryOptions = countries.map((country) => ({
    value: country.iso,
    label: getCountryDisplayName(country.iso, 'en'),
  }));
  const timeZones = new Set(['UTC', ...Intl.supportedValuesOf('timeZone')]);
  if (value !== null) timeZones.add(value.timeZone);
  const timeZoneOptions = [...timeZones]
    .sort()
    .map((zone) => ({ value: zone, label: zone.replaceAll('_', ' ') }));
  const availableNameOptions = [...nameOptions];
  if (
    value !== null &&
    !availableNameOptions.some((option) => option.value === value.nameTranslationKey)
  ) {
    availableNameOptions.push({
      value: value.nameTranslationKey,
      label: `${value.nameTranslationKey} (missing active English name)`,
    });
  }
  const hasActiveName = nameOptions.some((option) => option.value === nameTranslationKey);
  const canSubmit =
    !isSaving &&
    countries.some((country) => country.iso === countryIso) &&
    slug.trim().length <= 120 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim()) &&
    nameTranslationKey.length > 0 &&
    (!isActive || hasActiveName) &&
    timeZones.has(timeZone);

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit) return;
    setSubmitError(null);
    try {
      await onSubmit({ countryIso, slug: slug.trim(), nameTranslationKey, timeZone, isActive });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not save the community.');
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isSaving) onOpenChange(isOpen);
      }}
    >
      <DialogContent
        className="max-h-[90dvh] max-w-lg overflow-y-auto"
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="mb-4">
          <DialogTitle>{value === null ? 'New community' : 'Edit community'}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <Field>
            <FieldLabel
              id="community-country-label"
              htmlFor="community-country"
            >
              Country:
              <RequiredIndicator />
            </FieldLabel>
            <SearchableSelect
              id="community-country"
              value={countryIso}
              options={countryOptions}
              placeholder="Select country"
              searchPlaceholder="Search countries"
              emptyText="No countries found."
              ariaLabelledBy="community-country-label"
              isDisabled={isSaving}
              isRequired
              onValueChange={setCountryIso}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="community-slug">
              Slug:
              <RequiredIndicator />
            </FieldLabel>
            <Input
              id="community-slug"
              value={slug}
              maxLength={120}
              required
              disabled={isSaving}
              placeholder="barcelona"
              onChange={(event) => setSlug(event.target.value)}
            />
            <FieldDescription>
              Lowercase letters, numbers and single hyphens. Feed: /feed/
              {countryIso.toLowerCase() || 'country'}/{slug.trim() || 'community'}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel
              id="community-name-label"
              htmlFor="community-name"
            >
              Name:
              <RequiredIndicator />
            </FieldLabel>
            <SearchableSelect
              id="community-name"
              value={nameTranslationKey}
              options={availableNameOptions}
              placeholder="Select translated name"
              searchPlaceholder="Search community names"
              emptyText="No active English names found."
              ariaLabelledBy="community-name-label"
              isDisabled={isSaving}
              isRequired
              onValueChange={setNameTranslationKey}
            />
            <FieldDescription>
              Manage community names in{' '}
              <Link
                href="/admin/translations"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Text content
              </Link>{' '}
              under the community namespace.
            </FieldDescription>
            {isActive && nameTranslationKey.length > 0 && !hasActiveName ? (
              <p className="text-sm text-destructive">
                An active English name is required to activate this community.
              </p>
            ) : null}
          </Field>
          <Field>
            <FieldLabel
              id="community-time-zone-label"
              htmlFor="community-time-zone"
            >
              Time zone:
              <RequiredIndicator />
            </FieldLabel>
            <SearchableSelect
              id="community-time-zone"
              value={timeZone}
              options={timeZoneOptions}
              placeholder="Select time zone"
              searchPlaceholder="Search time zones"
              emptyText="No time zones found."
              ariaLabelledBy="community-time-zone-label"
              isDisabled={isSaving}
              isRequired
              onValueChange={setTimeZone}
            />
          </Field>
          <Field className="flex-row items-center justify-between">
            <FieldLabel htmlFor="community-active">Active</FieldLabel>
            <Switch
              id="community-active"
              checked={isActive}
              disabled={isSaving}
              onCheckedChange={setIsActive}
            />
          </Field>
          {submitError ? (
            <p
              role="alert"
              className="text-sm text-destructive"
            >
              {submitError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
            >
              {isSaving ? 'Saving…' : value === null ? 'Create community' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
