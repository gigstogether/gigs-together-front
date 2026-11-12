'use client';

import { useState } from 'react';

import AdminLocationForm, { AdminLocationNameFields } from '../shared/AdminLocationForm';
import {
  getAdminCountryOptionLabel,
  getAdminLocationAliasesError,
  getAdminLocationSaveError,
  parseAdminLocationAliases,
} from '../shared/admin-location-form';
import type { AdminLocality, AdminPlace, AdminRegion } from '../../_lib/admin-locations-api';
import { Select } from '@/components/Select';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

export interface AdminPlaceFormSubmission {
  id: string | null;
  localityId: string;
  name: string;
  aliases: string[];
  isActive: boolean;
}

interface AdminPlaceFormDialogProps {
  value: AdminPlace | null;
  regions: AdminRegion[];
  localities: AdminLocality[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: AdminPlaceFormSubmission) => Promise<void>;
}

function getLocalityOptionLabel(locality: AdminLocality, regions: AdminRegion[]): string {
  const region = regions.find((candidate) => candidate.id === locality.regionId);
  if (!region) {
    return locality.name;
  }

  return `${locality.name} — ${region.name} — ${getAdminCountryOptionLabel(region.countryIso)}`;
}

export default function AdminPlaceFormDialog(props: AdminPlaceFormDialogProps) {
  const { value, regions, localities, isSaving, onOpenChange, onSubmit } = props;

  const [localityId, setLocalityId] = useState(value?.localityId ?? localities[0]?.id ?? '');
  const [name, setName] = useState(value?.name ?? '');
  const [aliasesText, setAliasesText] = useState(value?.aliases.join(', ') ?? '');
  const [isActive, setIsActive] = useState(value?.isActive ?? true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const aliases = parseAdminLocationAliases(aliasesText);
  const aliasesError = getAdminLocationAliasesError(name, aliases);
  const isCreateMode = value === null;
  const canSubmit =
    localityId.length > 0 && name.trim().length > 0 && aliasesError === null && !isSaving;
  const localityOptions = localities.map((locality) => ({
    value: locality.id,
    label: getLocalityOptionLabel(locality, regions),
  }));

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitError(null);
    try {
      await onSubmit({
        id: value?.id ?? null,
        localityId,
        name: name.trim(),
        aliases,
        isActive,
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
        Locality:
      </FieldLabel>
      <Select
        id="location-form-parent"
        value={localityId}
        options={localityOptions}
        placeholder="Select locality"
        ariaLabelledBy="location-form-parent-label"
        isDisabled={isSaving || !isCreateMode}
        onValueChange={setLocalityId}
      />
      {!isCreateMode ? (
        <FieldDescription>The parent cannot be changed after creation.</FieldDescription>
      ) : null}
    </Field>
  );

  const additionalFields = (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2">
      <div>
        <FieldLabel
          id="location-form-active-label"
          htmlFor="location-form-active"
        >
          Active:
        </FieldLabel>
        <FieldDescription>
          Inactive places stay in the catalog but cannot be selected.
        </FieldDescription>
      </div>
      <Switch
        id="location-form-active"
        checked={isActive}
        disabled={isSaving}
        aria-labelledby="location-form-active-label"
        onCheckedChange={setIsActive}
      />
    </div>
  );

  return (
    <AdminLocationForm
      entityLabel="place"
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
