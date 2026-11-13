'use client';

import { useState } from 'react';

import AdminLocationForm, { AdminLocationNameFields } from '../shared/AdminLocationForm';
import {
  getAdminCountryOptionLabel,
  getAdminLocationAliasesError,
  getAdminLocationSaveError,
  parseAdminLocationAliases,
} from '../shared/admin-location-form';
import { getAdminLocalityLabel } from '../shared/admin-location-display';
import type { AdminLocality, AdminVenue } from '../../_lib/admin-locations-api';
import RequiredIndicator from '@/components/RequiredIndicator';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

export interface AdminVenueFormSubmission {
  id: string | null;
  localityId: string;
  name: string;
  aliases: string[];
  isActive: boolean;
}

interface AdminVenueFormDialogProps {
  value: AdminVenue | null;
  localities: AdminLocality[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: AdminVenueFormSubmission) => Promise<void>;
}

function getLocalityOptionLabel(locality: AdminLocality): string {
  return `${getAdminLocalityLabel(locality.name, locality.qualifier)} — ${getAdminCountryOptionLabel(locality.countryIso)}`;
}

export default function AdminVenueFormDialog(props: AdminVenueFormDialogProps) {
  const { value, localities, isSaving, onOpenChange, onSubmit } = props;

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
    label: getLocalityOptionLabel(locality),
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
        <RequiredIndicator />
      </FieldLabel>
      <SearchableSelect
        id="location-form-parent"
        value={localityId}
        options={localityOptions}
        placeholder="Select locality"
        searchPlaceholder="Search localities"
        emptyText="No localities found."
        ariaLabelledBy="location-form-parent-label"
        isDisabled={isSaving || !isCreateMode}
        isRequired
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
          Inactive venues stay in the catalog but cannot be selected.
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
      entityLabel="venue"
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
