'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GripVertical } from 'lucide-react';
import { useMemo, useState } from 'react';

import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import { adminKeys } from '@/app/admin/adminKeys';
import {
  getAdminLanguageOrderUpdates,
  reorderAdminLanguagesByIso,
  sortAdminLanguages,
} from '@/app/admin/reorder-admin-languages';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { fetchAdminLanguages, patchAdminLanguage } from '@/lib/admin-api';
import type { AdminLanguage, PatchAdminLanguageBody } from '@/lib/admin-api';

const DRAG_DATA_MIME = 'application/x-admin-language-iso';

export default function AdminLanguagesPageClient() {
  const queryClient = useQueryClient();
  const [dragOverIso, setDragOverIso] = useState<string | null>(null);
  const [draggedIso, setDraggedIso] = useState<string | null>(null);
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

  const sortedLanguages = useMemo(
    () => sortAdminLanguages(languagesQuery.data ?? []),
    [languagesQuery.data],
  );

  const languages = optimisticLanguages ?? sortedLanguages;
  const isSaving = updateMutation.isPending;

  const clearDragState = () => {
    setDraggedIso(null);
    setDragOverIso(null);
  };

  const persistLanguageOrder = async (nextLanguages: readonly AdminLanguage[]) => {
    const updates = getAdminLanguageOrderUpdates(sortedLanguages, nextLanguages);
    if (updates.length === 0) {
      return;
    }

    setReorderError(null);
    setOptimisticLanguages(nextLanguages);
    try {
      await Promise.all(
        updates.map((update) => patchAdminLanguage(update.iso, { order: update.order })),
      );
      await queryClient.invalidateQueries({ queryKey: adminKeys.languages() });
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
                  onDragStart={() => setDraggedIso(language.iso)}
                  onDragOver={() => setDragOverIso(language.iso)}
                  onDragLeave={() => {
                    setDragOverIso((current) => (current === language.iso ? null : current));
                  }}
                  onDrop={() => handleDrop(language.iso)}
                  onDragEnd={clearDragState}
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

interface AdminLanguageItemProps {
  readonly language: AdminLanguage;
  readonly isSaving: boolean;
  readonly isDragging: boolean;
  readonly isDragOver: boolean;
  readonly onDragStart: () => void;
  readonly onDragOver: () => void;
  readonly onDragLeave: () => void;
  readonly onDrop: () => void;
  readonly onDragEnd: () => void;
  readonly onUpdate: (body: PatchAdminLanguageBody) => void;
}

function AdminLanguageItem(props: AdminLanguageItemProps) {
  const {
    language,
    isSaving,
    isDragging,
    isDragOver,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    onUpdate,
  } = props;
  const [nameDraft, setNameDraft] = useState(language.name);

  const commitName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === language.name) {
      setNameDraft(language.name);
      return;
    }
    onUpdate({ name: trimmed });
  };

  return (
    <li
      aria-label={`Language ${language.iso}`}
      className={cn(
        'flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center',
        isDragging && 'opacity-50',
        isDragOver && 'bg-muted/50',
      )}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    >
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          draggable={!isSaving}
          aria-label={`Reorder ${language.iso}`}
          disabled={isSaving}
          className="inline-flex cursor-grab items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData(DRAG_DATA_MIME, language.iso);
            onDragStart();
          }}
          onDragEnd={onDragEnd}
        >
          <GripVertical
            className="h-4 w-4"
            aria-hidden
          />
        </button>
        <span
          className="inline-flex w-8 items-center justify-center font-mono text-sm tabular-nums text-muted-foreground"
          aria-label={`Order for ${language.iso}`}
        >
          {language.order}
        </span>
        <span className="inline-flex min-w-12 items-center justify-center rounded-md bg-muted px-2 py-1 font-mono text-xs uppercase">
          {language.iso}
        </span>
      </div>
      <Input
        value={nameDraft}
        disabled={isSaving}
        aria-label={`Name for ${language.iso}`}
        className="sm:flex-1"
        onChange={(event) => setNameDraft(event.target.value)}
        onBlur={commitName}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
        }}
      />
      <Switch
        checked={language.isActive}
        disabled={isSaving}
        aria-label={`Active for ${language.iso}`}
        className="shrink-0 sm:ml-auto"
        onCheckedChange={(checked) => onUpdate({ isActive: checked })}
      />
    </li>
  );
}
