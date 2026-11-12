'use client';

import { useState } from 'react';

import AdminLocationForm, { AdminLocationNameFields } from '../shared/AdminLocationForm';
import {
  getAdminCountryOptionLabel,
  getAdminLocationAliasesError,
  getAdminLocationSaveError,
  parseAdminLocationAliases,
} from '../shared/admin-location-form';
import type { AdminLocality, AdminRegion } from '../../_lib/admin-locations-api';
import { Select } from '@/components/Select';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

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

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export default function AdminLocalityFormDialog(props: AdminLocalityFormDialogProps) {
  const { value, regions, isSaving, onOpenChange, onSubmit } = props;

  const [regionId, setRegionId] = useState(value?.regionId ?? regions[0]?.id ?? '');
  const [name, setName] = useState(value?.name ?? '');
  const [aliasesText, setAliasesText] = useState(value?.aliases.join(', ') ?? '');
  const [timeZone, setTimeZone] = useState(value?.timeZone ?? '');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const aliases = parseAdminLocationAliases(aliasesText);
  const aliasesError = getAdminLocationAliasesError(name, aliases);
  const isTimeZoneValid = isValidTimeZone(timeZone.trim());
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
        timeZone: timeZone.trim(),
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
        onValueChange={setRegionId}
      />
      {!isCreateMode ? (
        <FieldDescription>The parent cannot be changed after creation.</FieldDescription>
      ) : null}
    </Field>
  );

  const additionalFields = (
    <Field>
      <FieldLabel htmlFor="location-form-time-zone">Time zone:</FieldLabel>
      <Input
        id="location-form-time-zone"
        value={timeZone}
        disabled={isSaving}
        placeholder="Europe/Madrid"
        aria-invalid={!isTimeZoneValid}
        onChange={(event) => setTimeZone(event.target.value)}
      />
      <FieldError errors={isTimeZoneValid ? [] : [{ message: 'Enter a valid IANA time zone.' }]} />
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
