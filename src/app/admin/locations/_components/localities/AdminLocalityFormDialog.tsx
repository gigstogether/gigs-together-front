'use client';

import { useMemo, useState } from 'react';

import AdminLocationForm, { AdminLocationNameFields } from '../shared/AdminLocationForm';
import {
  getAdminCountryOptionLabel,
  getAdminLocationAliasesError,
  getAdminLocationSaveError,
  parseAdminLocationAliases,
} from '../shared/admin-location-form';
import type { AdminLocality, AdminRegion } from '../../_lib/admin-locations-api';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Select } from '@/components/Select';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';

export interface AdminLocalityFormSubmission {
  id: string | null;
  regionId: string;
  name: string;
  aliases: string[];
  timeZone: string;
}

interface AdminLocalityFormDialogProps {
  value: AdminLocality | null;
  regions: AdminRegion[];
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

function getInitialTimeZone(
  value: AdminLocality | null,
  regions: AdminRegion[],
  regionId: string,
): string {
  if (value) {
    return value.timeZone;
  }

  const region = regions.find((candidate) => candidate.id === regionId);
  const timeZoneOptions = getTimeZoneOptions(region?.countryIso);
  return timeZoneOptions.length === 1 ? timeZoneOptions[0].value : '';
}

export default function AdminLocalityFormDialog(props: AdminLocalityFormDialogProps) {
  const { value, regions, isSaving, onOpenChange, onSubmit } = props;

  const [regionId, setRegionId] = useState(value?.regionId ?? regions[0]?.id ?? '');
  const [name, setName] = useState(value?.name ?? '');
  const [aliasesText, setAliasesText] = useState(value?.aliases.join(', ') ?? '');
  const [timeZone, setTimeZone] = useState(() => getInitialTimeZone(value, regions, regionId));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedRegion = regions.find((region) => region.id === regionId);
  const timeZoneOptions = useMemo(
    () => getTimeZoneOptions(selectedRegion?.countryIso),
    [selectedRegion?.countryIso],
  );
  const aliases = parseAdminLocationAliases(aliasesText);
  const aliasesError = getAdminLocationAliasesError(name, aliases);
  const isTimeZoneValid = timeZoneOptions.some((option) => option.value === timeZone);
  const isCreateMode = value === null;
  const canSubmit =
    regionId.length > 0 &&
    name.trim().length > 0 &&
    aliasesError === null &&
    isTimeZoneValid &&
    !isSaving;
  const regionOptions = regions.map((region) => ({
    value: region.id,
    label: `${region.name} — ${getAdminCountryOptionLabel(region.countryIso)}`,
  }));

  const handleRegionChange = (nextRegionId: string) => {
    const nextRegion = regions.find((region) => region.id === nextRegionId);
    const nextTimeZoneOptions = getTimeZoneOptions(nextRegion?.countryIso);

    setRegionId(nextRegionId);
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
        regionId,
        name: name.trim(),
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
        Region:
      </FieldLabel>
      <Select
        id="location-form-parent"
        value={regionId}
        options={regionOptions}
        placeholder="Select region"
        ariaLabelledBy="location-form-parent-label"
        isDisabled={isSaving || !isCreateMode}
        onValueChange={handleRegionChange}
      />
      {!isCreateMode ? (
        <FieldDescription>The parent cannot be changed after creation.</FieldDescription>
      ) : null}
    </Field>
  );

  const additionalFields = (
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
        isDisabled={isSaving || selectedRegion === undefined}
        isRequired
        onValueChange={setTimeZone}
      />
    </Field>
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
