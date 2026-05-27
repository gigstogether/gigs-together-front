'use client';

import { GripVertical } from 'lucide-react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { AdminLanguage, PatchAdminLanguageBody } from '@/lib/admin-api';

const DRAG_DATA_MIME = 'application/x-admin-language-iso';

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

export default function AdminLanguageItem(props: AdminLanguageItemProps) {
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
      <div className="flex items-center justify-between gap-3 sm:contents">
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
