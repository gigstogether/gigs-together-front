'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AdminLocationNameFieldsProps {
  name: string;
  aliasesText: string;
  aliasesError: string | null;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onAliasesTextChange: (aliasesText: string) => void;
}

interface AdminLocationFormProps {
  entityLabel: string;
  isCreateMode: boolean;
  isSaving: boolean;
  canSubmit: boolean;
  submitError: string | null;
  parentField: ReactNode;
  additionalFields?: ReactNode;
  nameFields: ReactNode;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => Promise<void>;
}

export function AdminLocationNameFields(props: AdminLocationNameFieldsProps) {
  const { name, aliasesText, aliasesError, isSaving, onNameChange, onAliasesTextChange } = props;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="location-form-name">Canonical name:</FieldLabel>
        <Input
          id="location-form-name"
          value={name}
          disabled={isSaving}
          autoFocus
          onChange={(event) => onNameChange(event.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="location-form-aliases">Aliases:</FieldLabel>
        <Textarea
          id="location-form-aliases"
          value={aliasesText}
          disabled={isSaving}
          rows={3}
          placeholder="Separate aliases with commas or new lines"
          aria-invalid={aliasesError !== null}
          onChange={(event) => onAliasesTextChange(event.target.value)}
        />
        <FieldError errors={aliasesError ? [{ message: aliasesError }] : []} />
      </Field>
    </>
  );
}

export default function AdminLocationForm(props: AdminLocationFormProps) {
  const {
    entityLabel,
    isCreateMode,
    isSaving,
    canSubmit,
    submitError,
    parentField,
    additionalFields,
    nameFields,
    onOpenChange,
    onSubmit,
  } = props;

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="max-w-lg"
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="mb-6">
          <DialogTitle>{isCreateMode ? `New ${entityLabel}` : `Edit ${entityLabel}`}</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
          }}
        >
          {parentField}
          {nameFields}
          {additionalFields}

          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

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
              {isCreateMode ? `Create ${entityLabel}` : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
