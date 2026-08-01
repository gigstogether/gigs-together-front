'use client';

import { GripVertical } from 'lucide-react';
import { useMemo, useState } from 'react';

import { bindAdminLocalePointerReorder } from '@/app/admin/locales/_lib/admin-locale-pointer-reorder';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { PatchAdminLocaleBody, SupportedLocale } from '@/app/admin/_lib/admin-api';

/** Must stay active; matches API translation default locale fallback. */
const REQUIRED_ACTIVE_LOCALE_ISO = 'en';

interface AdminLocaleItemProps {
  readonly locale: SupportedLocale;
  readonly isSaving: boolean;
  readonly isDragging: boolean;
  readonly isDragOver: boolean;
  readonly onReorderStart: () => void;
  readonly onReorderOver: (iso: string) => void;
  readonly onReorderDropOn: (targetIso: string) => void;
  readonly onReorderEnd: () => void;
  readonly onUpdate: (body: PatchAdminLocaleBody) => void;
}

export default function AdminLocaleItem(props: AdminLocaleItemProps) {
  const {
    locale,
    isSaving,
    isDragging,
    isDragOver,
    onReorderStart,
    onReorderOver,
    onReorderDropOn,
    onReorderEnd,
    onUpdate,
  } = props;
  const [nativeNameDraft, setNativeNameDraft] = useState(locale.nativeName);

  const pointerReorder = useMemo(
    () =>
      bindAdminLocalePointerReorder({
        excludedIso: locale.iso,
        isDisabled: isSaving,
        onStart: onReorderStart,
        onOver: onReorderOver,
        onDropOn: onReorderDropOn,
        onEnd: onReorderEnd,
      }),
    [isSaving, locale.iso, onReorderDropOn, onReorderEnd, onReorderOver, onReorderStart],
  );

  const commitNativeName = () => {
    const trimmed = nativeNameDraft.trim();
    if (!trimmed || trimmed === locale.nativeName) {
      setNativeNameDraft(locale.nativeName);
      return;
    }
    onUpdate({ nativeName: trimmed });
  };

  return (
    <li
      data-locale-iso={locale.iso}
      aria-label={`Locale ${locale.iso}`}
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
            aria-label={`Reorder ${locale.iso}`}
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
            aria-label={`Order for ${locale.iso}`}
          >
            {locale.order}
          </span>
          <span className="rounded-md border border-border/70 px-1.5 py-0.5 font-mono text-sm uppercase tracking-wide text-muted-foreground">
            {locale.iso}
          </span>
        </div>
        <Switch
          checked={locale.isActive}
          disabled={isSaving || locale.iso === REQUIRED_ACTIVE_LOCALE_ISO}
          aria-label={`Active for ${locale.iso}`}
          className="shrink-0 sm:order-3 sm:ml-auto"
          onCheckedChange={(checked) => onUpdate({ isActive: checked })}
        />
      </div>
      <Input
        value={nativeNameDraft}
        disabled={isSaving}
        aria-label={`Native name for ${locale.iso}`}
        className="w-full sm:order-2 sm:flex-1"
        onChange={(event) => setNativeNameDraft(event.target.value)}
        onBlur={commitNativeName}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
        }}
      />
    </li>
  );
}
