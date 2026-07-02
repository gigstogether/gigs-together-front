'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import AdminLocaleItem from '@/app/admin/locales/_components/AdminLocaleItem';
import {
  getAdminLocaleOrderUpdates,
  reorderAdminLocalesByIso,
} from '@/app/admin/locales/reorder-admin-locales';
import { adminKeys } from '@/app/admin/adminKeys';
import { Card, CardContent } from '@/components/ui/card';
import { fetchAdminLocales, patchAdminLocale, patchAdminLocalesOrder } from '@/lib/admin-api';
import type { PatchAdminLocaleBody, SupportedLocale } from '@/lib/admin-api';

export default function AdminLocalesPageClient() {
  const queryClient = useQueryClient();
  const [dragOverIso, setDragOverIso] = useState<string | null>(null);
  const [draggedIso, setDraggedIso] = useState<string | null>(null);
  // Temporary reorder preview while order PATCH requests are in flight.
  const [optimisticLocales, setOptimisticLocales] = useState<readonly SupportedLocale[] | null>(
    null,
  );
  const [reorderError, setReorderError] = useState<string | null>(null);

  const localesQuery = useQuery({
    queryKey: adminKeys.locales(),
    queryFn: fetchAdminLocales,
  });

  const updateMutation = useMutation({
    mutationFn: (params: { iso: string; body: PatchAdminLocaleBody }) =>
      patchAdminLocale(params.iso, params.body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.locales() });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: patchAdminLocalesOrder,
    onSuccess: (locales) => {
      queryClient.setQueryData(adminKeys.locales(), locales);
    },
  });

  const queryLocales = localesQuery.data ?? [];
  const locales = optimisticLocales ?? queryLocales;
  const isSaving = updateMutation.isPending || reorderMutation.isPending;

  const clearDragState = () => {
    setDraggedIso(null);
    setDragOverIso(null);
  };

  const persistLocaleOrder = async (nextLocales: readonly SupportedLocale[]) => {
    const updates = getAdminLocaleOrderUpdates(queryLocales, nextLocales);
    if (updates.length === 0) {
      return;
    }

    setReorderError(null);
    setOptimisticLocales(nextLocales);
    try {
      await reorderMutation.mutateAsync(updates);
    } catch {
      setReorderError('Could not save locale order.');
    } finally {
      setOptimisticLocales(null);
    }
  };

  const handleDrop = (targetIso: string) => {
    if (!draggedIso || draggedIso === targetIso) {
      clearDragState();
      return;
    }

    const nextLocales = reorderAdminLocalesByIso(locales, draggedIso, targetIso);
    clearDragState();
    void persistLocaleOrder(nextLocales);
  };

  const updateErrorMessage =
    updateMutation.error instanceof Error
      ? updateMutation.error.message
      : updateMutation.error != null
        ? String(updateMutation.error)
        : null;

  return (
    <>
      <AdminPageHeader
        title="Locales"
        description="Configure active locales and display order."
      />
      {localesQuery.isError ? (
        <p className="mb-4 text-sm text-destructive">Could not load locales.</p>
      ) : null}
      {updateMutation.isError ? (
        <p className="mb-4 text-sm text-destructive">
          Could not save locale changes.
          {updateErrorMessage ? ` ${updateErrorMessage}` : null}
        </p>
      ) : null}
      {reorderError ? <p className="mb-4 text-sm text-destructive">{reorderError}</p> : null}
      {localesQuery.isLoading ? (
        <p className="py-10 text-sm text-muted-foreground">Loading locales…</p>
      ) : locales.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">No locales configured.</p>
      ) : (
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {locales.map((locale) => (
                <AdminLocaleItem
                  key={`${locale.iso}:${locale.nativeName}`}
                  locale={locale}
                  isSaving={isSaving}
                  isDragging={draggedIso === locale.iso}
                  isDragOver={dragOverIso === locale.iso && draggedIso !== locale.iso}
                  onReorderStart={() => setDraggedIso(locale.iso)}
                  onReorderOver={setDragOverIso}
                  onReorderDropOn={handleDrop}
                  onReorderEnd={clearDragState}
                  onUpdate={(body) => updateMutation.mutate({ iso: locale.iso, body })}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
