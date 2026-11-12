'use client';

import { useState } from 'react';

import AdminLocationForm, { AdminLocationNameFields } from '../shared/AdminLocationForm';
import {
  getAdminCountryOptionLabel,
  getAdminLocationAliasesError,
  getAdminLocationSaveError,
  parseAdminLocationAliases,
} from '../shared/admin-location-form';
import type { AdminCountry } from '../../_lib/admin-countries-api';
import type { AdminRegion } from '../../_lib/admin-locations-api';
import NativeSelect from '@/components/NativeSelect';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';

export interface AdminRegionFormSubmission {
  id: string | null;
  countryIso: string;
  name: string;
  aliases: string[];
}

interface AdminRegionFormDialogProps {
  value: AdminRegion | null;
  countries: AdminCountry[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: AdminRegionFormSubmission) => Promise<void>;
}

export default function AdminRegionFormDialog(props: AdminRegionFormDialogProps) {
  const { value, countries, isSaving, onOpenChange, onSubmit } = props;

  const [countryIso, setCountryIso] = useState(value?.countryIso ?? countries[0]?.iso ?? '');
  const [name, setName] = useState(value?.name ?? '');
  const [aliasesText, setAliasesText] = useState(value?.aliases.join(', ') ?? '');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const aliases = parseAdminLocationAliases(aliasesText);
  const aliasesError = getAdminLocationAliasesError(name, aliases);
  const isCreateMode = value === null;
  const canSubmit =
    countryIso.length > 0 && name.trim().length > 0 && aliasesError === null && !isSaving;

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
        aliases,
      });
    } catch (e) {
      setSubmitError(getAdminLocationSaveError(e));
    }
  };

  const parentField = (
    <Field>
      <FieldLabel htmlFor="location-form-parent">Country:</FieldLabel>
      <NativeSelect
        id="location-form-parent"
        value={countryIso}
        disabled={isSaving || !isCreateMode}
        onChange={(event) => setCountryIso(event.target.value)}
      >
        {countries.map((country) => (
          <option
            key={country.iso}
            value={country.iso}
          >
            {getAdminCountryOptionLabel(country.iso)}
          </option>
        ))}
      </NativeSelect>
      {!isCreateMode ? (
        <FieldDescription>The parent cannot be changed after creation.</FieldDescription>
      ) : null}
    </Field>
  );

  return (
    <AdminLocationForm
      entityLabel="region"
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
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    />
  );
}
