'use client';

import { useMemo, useState } from 'react';

import AdminLocationForm, { AdminLocationNameFields } from '../shared/AdminLocationForm';
import {
  getAdminCountryOptionLabel,
  getAdminLocationAliasesError,
  getAdminLocationSaveError,
  parseAdminLocationAliases,
} from '../shared/admin-location-form';
import type { AdminCountry } from '../../_lib/admin-countries-api';
import type { AdminLocality } from '../../_lib/admin-locations-api';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Select } from '@/components/Select';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export interface AdminLocalityFormSubmission {
  id: string | null;
  countryIso: string;
  name: string;
  qualifier: string | null;
  aliases: string[];
  timeZone: string;
}

interface AdminLocalityFormDialogProps {
  value: AdminLocality | null;
  countries: AdminCountry[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: AdminLocalityFormSubmission) => Promise<void>;
}

interface LocaleWithTimeZones extends Intl.Locale {
  getTimeZones(): string[] | undefined;
}

function hasTimeZoneLookup(locale: Intl.Locale): locale is LocaleWithTimeZones {
  return 'getTimeZones' in locale && typeof locale.getTimeZones === 'function';
}

function getAllTimeZones(): string[] {
  const timeZones = Intl.supportedValuesOf('timeZone');
  if (timeZones.includes('UTC')) {
    return timeZones;
  }

  return ['UTC', ...timeZones];
}

function getCountryTimeZones(countryIso: string): string[] {
  const locale = new Intl.Locale('und', { region: countryIso });
  if (!hasTimeZoneLookup(locale)) {
    return getAllTimeZones();
  }

  return locale.getTimeZones() ?? getAllTimeZones();
}

function getTimeZoneOptions(countryIso: string | undefined) {
  if (!countryIso) {
    return [];
  }

  return getCountryTimeZones(countryIso).map((timeZone) => ({
    value: timeZone,
    label: timeZone.replaceAll('_', ' '),
  }));
}

function getInitialTimeZone(value: AdminLocality | null, countryIso: string): string {
  if (value) {
    return value.timeZone;
  }

  const timeZoneOptions = getTimeZoneOptions(countryIso);
  return timeZoneOptions.length === 1 ? timeZoneOptions[0].value : '';
}

export default function AdminLocalityFormDialog(props: AdminLocalityFormDialogProps) {
  const { value, countries, isSaving, onOpenChange, onSubmit } = props;

  const [countryIso, setCountryIso] = useState(value?.countryIso ?? countries[0]?.iso ?? '');
  const [name, setName] = useState(value?.name ?? '');
  const [qualifier, setQualifier] = useState(value?.qualifier ?? '');
  const [aliasesText, setAliasesText] = useState(value?.aliases.join(', ') ?? '');
  const [timeZone, setTimeZone] = useState(() => getInitialTimeZone(value, countryIso));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const timeZoneOptions = useMemo(() => getTimeZoneOptions(countryIso), [countryIso]);
  const aliases = parseAdminLocationAliases(aliasesText);
  const aliasesError = getAdminLocationAliasesError(name, aliases);
  const isTimeZoneValid = timeZoneOptions.some((option) => option.value === timeZone);
  const isCreateMode = value === null;
  const canSubmit =
    countryIso.length > 0 &&
    name.trim().length > 0 &&
    aliasesError === null &&
    isTimeZoneValid &&
    !isSaving;
  const countryOptions = countries.map((country) => ({
    value: country.iso,
    label: getAdminCountryOptionLabel(country.iso),
  }));

  const handleCountryChange = (nextCountryIso: string) => {
    const nextTimeZoneOptions = getTimeZoneOptions(nextCountryIso);

    setCountryIso(nextCountryIso);
    if (nextTimeZoneOptions.length === 1) {
      setTimeZone(nextTimeZoneOptions[0].value);
      return;
    }

    if (!nextTimeZoneOptions.some((option) => option.value === timeZone)) {
      setTimeZone('');
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitError(null);
    try {
      await onSubmit({
        id: value?.id ?? null,
        countryIso,
        name: name.trim(),
        qualifier: qualifier.trim() || null,
        aliases,
        timeZone,
      });
    } catch (e) {
      setSubmitError(getAdminLocationSaveError(e));
    }
  };

  const parentField = (
    <Field>
      <FieldLabel
        id="location-form-parent-label"
        htmlFor="location-form-parent"
      >
        Country:
      </FieldLabel>
      <Select
        id="location-form-parent"
        value={countryIso}
        options={countryOptions}
        placeholder="Select country"
        ariaLabelledBy="location-form-parent-label"
        isDisabled={isSaving || !isCreateMode}
        isRequired
        onValueChange={handleCountryChange}
      />
      {!isCreateMode ? (
        <FieldDescription>The parent cannot be changed after creation.</FieldDescription>
      ) : null}
    </Field>
  );

  const additionalFields = (
    <>
      <Field>
        <FieldLabel htmlFor="location-form-qualifier">Qualifier:</FieldLabel>
        <Input
          id="location-form-qualifier"
          value={qualifier}
          disabled={isSaving}
          placeholder="Optional disambiguation"
          onChange={(event) => setQualifier(event.target.value)}
        />
        <FieldDescription>
          Distinguishes localities with the same name, for example a province or district.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel
          id="location-form-time-zone-label"
          htmlFor="location-form-time-zone"
        >
          Time zone:
        </FieldLabel>
        <SearchableSelect
          id="location-form-time-zone"
          value={timeZone}
          options={timeZoneOptions}
          placeholder="Select time zone"
          searchPlaceholder="Search time zones"
          emptyText="No time zones found."
          ariaLabelledBy="location-form-time-zone-label"
          isDisabled={isSaving || countryIso.length === 0}
          isRequired
          onValueChange={setTimeZone}
        />
      </Field>
    </>
  );

  return (
    <AdminLocationForm
      entityLabel="locality"
      isCreateMode={isCreateMode}
      isSaving={isSaving}
      canSubmit={canSubmit}
      submitError={submitError}
      parentField={parentField}
      nameFields={
        <AdminLocationNameFields
          name={name}
          aliasesText={aliasesText}
          aliasesError={aliasesError}
          isSaving={isSaving}
          onNameChange={setName}
          onAliasesTextChange={setAliasesText}
        />
      }
      additionalFields={additionalFields}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    />
  );
}
