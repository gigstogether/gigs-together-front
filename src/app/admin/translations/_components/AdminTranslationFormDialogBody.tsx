'use client';

import { useState } from 'react';

import AdminTranslationLocaleSelect from '@/app/admin/translations/_components/AdminTranslationLocaleSelect';
import AdminTranslationNamespaceCombobox from '@/app/admin/translations/_components/AdminTranslationNamespaceCombobox';
import type { AdminTranslationFormValues } from '@/app/admin/translations/_lib/admin-translation-form.types';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { PutAdminTranslationBody, SupportedLocale } from '@/app/admin/_lib/admin-api';
import { cn } from '@/lib/utils';
import { isValidTranslationKey } from '@/lib/i18n/translation-identifiers';

interface AdminTranslationFormDialogBodyProps {
  readonly mode: 'create' | 'edit';
  readonly initialValues: AdminTranslationFormValues;
  readonly namespaces: readonly string[];
  readonly locales: readonly SupportedLocale[];
  readonly isSaving: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (body: PutAdminTranslationBody) => Promise<void>;
}

export default function AdminTranslationFormDialogBody(props: AdminTranslationFormDialogBodyProps) {
  const { mode, initialValues, namespaces, locales, isSaving, onOpenChange, onSubmit } = props;

  const [formValues, setFormValues] = useState<AdminTranslationFormValues>(initialValues);

  const isCreateMode = mode === 'create';
  const trimmedKey = formValues.key.trim();
  const keyValidationError =
    trimmedKey.length > 0 && !isValidTranslationKey(trimmedKey)
      ? 'Key must be a valid camelCase translation key.'
      : null;
  const canSubmit =
    formValues.namespace.trim().length > 0 &&
    formValues.locale.trim().length > 0 &&
    trimmedKey.length > 0 &&
    isValidTranslationKey(trimmedKey) &&
    formValues.value.length > 0 &&
    !isSaving;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    await onSubmit({
      namespace: formValues.namespace.trim(),
      locale: formValues.locale.trim(),
      key: formValues.key.trim(),
      value: formValues.value,
      format: 'plain',
      kind: formValues.kind,
      isActive: formValues.isActive,
    });
  };

  return (
    <>
      <DialogHeader className="mb-6">
        <DialogTitle>{isCreateMode ? 'New translation' : 'Edit translation'}</DialogTitle>
      </DialogHeader>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel
              id="translation-form-namespace-label"
              htmlFor="translation-form-namespace"
            >
              Namespace
            </FieldLabel>
            {isCreateMode ? (
              <AdminTranslationNamespaceCombobox
                id="translation-form-namespace"
                value={formValues.namespace}
                namespaces={namespaces}
                isDisabled={isSaving}
                onChange={(namespace) => setFormValues((current) => ({ ...current, namespace }))}
              />
            ) : (
              <Input
                id="translation-form-namespace"
                value={formValues.namespace}
                disabled
                placeholder="about"
                className="h-9"
                aria-labelledby="translation-form-namespace-label"
              />
            )}
          </Field>
          <Field>
            <FieldLabel
              id="translation-form-locale-label"
              htmlFor="translation-form-locale"
            >
              Locale
            </FieldLabel>
            <AdminTranslationLocaleSelect
              id="translation-form-locale"
              value={formValues.locale}
              locales={locales}
              isDisabled={isSaving || !isCreateMode}
              onChange={(locale) => setFormValues((current) => ({ ...current, locale }))}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel
            id="translation-form-key-label"
            htmlFor="translation-form-key"
          >
            Key
          </FieldLabel>
          <Input
            id="translation-form-key"
            value={formValues.key}
            disabled={isSaving || !isCreateMode}
            placeholder="welcomeTitle or welcome.title"
            className={cn('font-mono', keyValidationError && 'border-destructive')}
            aria-labelledby="translation-form-key-label"
            aria-invalid={keyValidationError !== null}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, key: event.target.value }))
            }
          />
          <FieldError errors={keyValidationError ? [{ message: keyValidationError }] : []} />
          <FieldDescription>
            Dot-notation or camelCase identifier used to reference this string in code.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel
            id="translation-form-value-label"
            htmlFor="translation-form-value"
          >
            Value
          </FieldLabel>
          <Textarea
            id="translation-form-value"
            value={formValues.value}
            disabled={isSaving}
            rows={3}
            aria-labelledby="translation-form-value-label"
            onChange={(event) =>
              setFormValues((current) => ({ ...current, value: event.target.value }))
            }
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel
              id="translation-form-format-label"
              htmlFor="translation-form-format"
            >
              Format
            </FieldLabel>
            <Input
              id="translation-form-format"
              value="Plain"
              disabled
              className="h-9"
              aria-labelledby="translation-form-format-label"
            />
          </Field>
          <Field>
            <FieldLabel id="translation-form-kind-label">Kind</FieldLabel>
            <ToggleGroup
              id="translation-form-kind"
              type="single"
              role="radiogroup"
              value={formValues.kind}
              disabled={isSaving}
              variant="outline"
              size="default"
              aria-labelledby="translation-form-kind-label"
              className="h-9 w-full justify-stretch gap-0 rounded-md border border-input p-0 shadow-sm"
              onValueChange={(nextKind) => {
                if (nextKind === 'text' || nextKind === 'template') {
                  setFormValues((current) => ({ ...current, kind: nextKind }));
                }
              }}
            >
              <ToggleGroupItem
                value="text"
                className="h-full min-h-0 flex-1 rounded-none rounded-l-md border-0 px-3 shadow-none data-[state=on]:bg-accent"
              >
                Text
              </ToggleGroupItem>
              <ToggleGroupItem
                value="template"
                className="h-full min-h-0 flex-1 rounded-none rounded-r-md border-0 border-l border-input px-3 shadow-none data-[state=on]:bg-accent"
              >
                Template
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2">
          <div>
            <FieldLabel
              id="translation-form-active-label"
              htmlFor="translation-form-active"
              className="text-sm font-medium"
            >
              Active
            </FieldLabel>
            <FieldDescription>
              Inactive strings are hidden from consumers but kept in the catalog.
            </FieldDescription>
          </div>
          <Switch
            id="translation-form-active"
            checked={formValues.isActive}
            disabled={isSaving}
            aria-labelledby="translation-form-active-label"
            onCheckedChange={(checked) =>
              setFormValues((current) => ({ ...current, isActive: checked }))
            }
          />
        </div>

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
            {isCreateMode ? 'Create translation' : 'Save changes'}
          </Button>
        </div>
      </form>
    </>
  );
}
