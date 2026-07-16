'use client';

import AdminTranslationFormDialogBody from '@/app/admin/translations/_components/AdminTranslationFormDialogBody';
import type { AdminTranslationFormValues } from '@/app/admin/translations/admin-translation-form.types';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import type { PutAdminTranslationBody, SupportedLocale } from '@/lib/admin-api';

interface AdminTranslationFormDialogProps {
  readonly mode: 'create' | 'edit';
  readonly open: boolean;
  readonly initialValues: AdminTranslationFormValues;
  readonly namespaces: readonly string[];
  readonly locales: readonly SupportedLocale[];
  readonly isSaving: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (body: PutAdminTranslationBody) => Promise<void>;
}

export default function AdminTranslationFormDialog(props: AdminTranslationFormDialogProps) {
  const { mode, open, initialValues, namespaces, locales, isSaving, onOpenChange, onSubmit } =
    props;

  const formKey = `${mode}:${initialValues.namespace}:${initialValues.locale}:${initialValues.key}`;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger className="hidden">Open translation form dialog</DialogTrigger>
      <DialogContent
        className="max-w-lg"
        aria-describedby={undefined}
      >
        {open ? (
          <AdminTranslationFormDialogBody
            key={formKey}
            mode={mode}
            initialValues={initialValues}
            namespaces={namespaces}
            locales={locales}
            isSaving={isSaving}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
