'use client';

import { useState } from 'react';

import AdminTranslationLocaleSelect from '@/app/admin/translations/_components/AdminTranslationLocaleSelect';
import AdminTranslationNamespaceCombobox from '@/app/admin/translations/_components/AdminTranslationNamespaceCombobox';
import type { AdminTranslationFormValues } from '@/app/admin/translations/admin-translation-form.types';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { PutAdminTranslationBody, SupportedLocale } from '@/lib/admin-api';
import { isAdminTranslationKind } from '@/lib/admin-api';
import { cn } from '@/lib/utils';
import { isValidTranslationKey } from '@/lib/translation-identifiers';

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
          <FieldLabel htmlFor="translation-form-key">Key</FieldLabel>
          <Input
            id="translation-form-key"
            value={formValues.key}
            disabled={isSaving || !isCreateMode}
            placeholder="welcomeTitle or welcome.title"
            className={cn('font-mono', keyValidationError && 'border-destructive')}
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
          <FieldLabel htmlFor="translation-form-value">Value</FieldLabel>
          <Textarea
            id="translation-form-value"
            value={formValues.value}
            disabled={isSaving}
            rows={formValues.kind === 'template' ? 4 : 3}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, value: event.target.value }))
            }
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="translation-form-format">Format</FieldLabel>
            <Select
              value="plain"
              disabled
            >
              <SelectTrigger
                id="translation-form-format"
                className="h-10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[110]">
                <SelectItem value="plain">Plain</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="translation-form-kind">Kind</FieldLabel>
            <Select
              value={formValues.kind}
              disabled={isSaving}
              onValueChange={(nextKind) => {
                if (isAdminTranslationKind(nextKind)) {
                  setFormValues((current) => ({ ...current, kind: nextKind }));
                }
              }}
            >
              <SelectTrigger
                id="translation-form-kind"
                className="h-10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[110]">
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="template">Template</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2">
          <div>
            <p className="text-sm font-medium">Active</p>
            <FieldDescription>
              Inactive strings are hidden from consumers but kept in the catalog.
            </FieldDescription>
          </div>
          <Switch
            checked={formValues.isActive}
            disabled={isSaving}
            aria-label="Translation active"
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
