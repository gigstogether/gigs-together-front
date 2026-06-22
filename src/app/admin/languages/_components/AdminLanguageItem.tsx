'use client';

import { GripVertical } from 'lucide-react';
import { useMemo, useState } from 'react';

import { bindAdminLanguagePointerReorder } from '@/app/admin/languages/admin-language-pointer-reorder';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { AdminLanguage, PatchAdminLanguageBody } from '@/lib/admin-api';

interface AdminLanguageItemProps {
  readonly language: AdminLanguage;
  readonly isSaving: boolean;
  readonly isDragging: boolean;
  readonly isDragOver: boolean;
  readonly onReorderStart: () => void;
  readonly onReorderOver: (iso: string) => void;
  readonly onReorderDropOn: (targetIso: string) => void;
  readonly onReorderEnd: () => void;
  readonly onUpdate: (body: PatchAdminLanguageBody) => void;
}

export default function AdminLanguageItem(props: AdminLanguageItemProps) {
  const {
    language,
    isSaving,
    isDragging,
    isDragOver,
    onReorderStart,
    onReorderOver,
    onReorderDropOn,
    onReorderEnd,
    onUpdate,
  } = props;
  const [nameDraft, setNameDraft] = useState(language.name);

  const pointerReorder = useMemo(
    () =>
      bindAdminLanguagePointerReorder({
        excludedIso: language.iso,
        isDisabled: isSaving,
        onStart: onReorderStart,
        onOver: onReorderOver,
        onDropOn: onReorderDropOn,
        onEnd: onReorderEnd,
      }),
    [isSaving, language.iso, onReorderDropOn, onReorderEnd, onReorderOver, onReorderStart],
  );

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
      data-language-iso={language.iso}
      aria-label={`Language ${language.iso}`}
      className={cn(
        'flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center',
        isDragging && 'pointer-events-none opacity-50',
        isDragOver && 'bg-muted/50',
      )}
    >
      <div className="flex items-center justify-between gap-3 sm:contents">
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label={`Reorder ${language.iso}`}
            disabled={isSaving}
            className="inline-flex cursor-grab touch-none select-none items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
            onPointerDown={pointerReorder.onPointerDown}
            onPointerMove={pointerReorder.onPointerMove}
            onPointerUp={pointerReorder.onPointerUp}
            onPointerCancel={pointerReorder.onPointerCancel}
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
          <span className="rounded-md border border-border/70 px-1.5 py-0.5 font-mono text-sm uppercase tracking-wide text-muted-foreground">
            {language.iso}
          </span>
        </div>
        <Switch
          checked={language.isActive}
          disabled={isSaving}
          aria-label={`Active for ${language.iso}`}
          className="shrink-0 sm:order-3 sm:ml-auto"
          onCheckedChange={(checked) => onUpdate({ isActive: checked })}
        />
      </div>
      <Input
        value={nameDraft}
        disabled={isSaving}
        aria-label={`Name for ${language.iso}`}
        className="w-full sm:order-2 sm:flex-1"
        onChange={(event) => setNameDraft(event.target.value)}
        onBlur={commitName}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
        }}
      />
    </li>
  );
}
