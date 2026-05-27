'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import AdminLanguageItem from '@/app/admin/languages/_components/AdminLanguageItem';
import { adminKeys } from '@/app/admin/adminKeys';
import {
  getAdminLanguageOrderUpdates,
  reorderAdminLanguagesByIso,
} from '@/app/admin/reorder-admin-languages';
import { Card, CardContent } from '@/components/ui/card';
import { fetchAdminLanguages, patchAdminLanguage, patchAdminLanguagesOrder } from '@/lib/admin-api';
import type { AdminLanguage, PatchAdminLanguageBody } from '@/lib/admin-api';

export default function AdminLanguagesPageClient() {
  const queryClient = useQueryClient();
  const [dragOverIso, setDragOverIso] = useState<string | null>(null);
  const [draggedIso, setDraggedIso] = useState<string | null>(null);
  // Temporary reorder preview while order PATCH requests are in flight.
  const [optimisticLanguages, setOptimisticLanguages] = useState<readonly AdminLanguage[] | null>(
    null,
  );
  const [reorderError, setReorderError] = useState<string | null>(null);

  const languagesQuery = useQuery({
    queryKey: adminKeys.languages(),
    queryFn: fetchAdminLanguages,
  });

  const updateMutation = useMutation({
    mutationFn: (params: { iso: string; body: PatchAdminLanguageBody }) =>
      patchAdminLanguage(params.iso, params.body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.languages() });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: patchAdminLanguagesOrder,
    onSuccess: (languages) => {
      queryClient.setQueryData(adminKeys.languages(), languages);
    },
  });

  const queryLanguages = languagesQuery.data ?? [];
  const languages = optimisticLanguages ?? queryLanguages;
  const isSaving = updateMutation.isPending || reorderMutation.isPending;

  const clearDragState = () => {
    setDraggedIso(null);
    setDragOverIso(null);
  };

  const persistLanguageOrder = async (nextLanguages: readonly AdminLanguage[]) => {
    const updates = getAdminLanguageOrderUpdates(queryLanguages, nextLanguages);
    if (updates.length === 0) {
      return;
    }

    setReorderError(null);
    setOptimisticLanguages(nextLanguages);
    try {
      await reorderMutation.mutateAsync(updates);
    } catch {
      setReorderError('Could not save language order.');
    } finally {
      setOptimisticLanguages(null);
    }
  };

  const handleDrop = (targetIso: string) => {
    if (!draggedIso || draggedIso === targetIso) {
      clearDragState();
      return;
    }

    const nextLanguages = reorderAdminLanguagesByIso(languages, draggedIso, targetIso);
    clearDragState();
    void persistLanguageOrder(nextLanguages);
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
        title="Languages"
        description="Configure active locales and display order."
      />
      {languagesQuery.isError ? (
        <p className="mb-4 text-sm text-destructive">Could not load languages.</p>
      ) : null}
      {updateMutation.isError ? (
        <p className="mb-4 text-sm text-destructive">
          Could not save language changes.
          {updateErrorMessage ? ` ${updateErrorMessage}` : null}
        </p>
      ) : null}
      {reorderError ? <p className="mb-4 text-sm text-destructive">{reorderError}</p> : null}
      {languagesQuery.isLoading ? (
        <p className="py-10 text-sm text-muted-foreground">Loading languages…</p>
      ) : languages.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">No languages configured.</p>
      ) : (
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {languages.map((language) => (
                <AdminLanguageItem
                  key={`${language.iso}:${language.name}`}
                  language={language}
                  isSaving={isSaving}
                  isDragging={draggedIso === language.iso}
                  isDragOver={dragOverIso === language.iso && draggedIso !== language.iso}
                  onReorderStart={() => setDraggedIso(language.iso)}
                  onReorderOver={setDragOverIso}
                  onReorderDropOn={handleDrop}
                  onReorderEnd={clearDragState}
                  onUpdate={(body) => updateMutation.mutate({ iso: language.iso, body })}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
