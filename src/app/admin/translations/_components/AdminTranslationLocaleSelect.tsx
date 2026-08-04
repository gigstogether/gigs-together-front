'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useDismissOnPointerDownOutside } from '@/hooks/use-dismiss-on-pointer-down-outside';
import type { SupportedLocale } from '@/app/admin/_lib/admin-api';
import { cn } from '@/lib/utils';

interface AdminTranslationLocaleSelectProps {
  readonly id: string;
  readonly value: string;
  readonly locales: readonly SupportedLocale[];
  readonly isDisabled: boolean;
  readonly onChange: (locale: string) => void;
}

function formatLocaleOptionLabel(iso: string, nativeName: string, isActive: boolean): string {
  const inactiveSuffix = isActive ? '' : ' (inactive)';
  return `${nativeName} (${iso})${inactiveSuffix}`;
}

export default function AdminTranslationLocaleSelect(props: AdminTranslationLocaleSelectProps) {
  const { id, value, locales, isDisabled, onChange } = props;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useDismissOnPointerDownOutside({
    isOpen,
    onDismiss: () => setIsOpen(false),
  });
  const labelId = `${id}-label`;
  const listboxId = `${id}-listbox`;
  const ChevronIcon = isOpen ? ChevronUp : ChevronDown;

  const selectedLocale = locales.find((locale) => locale.iso === value);
  const triggerLabel = selectedLocale
    ? formatLocaleOptionLabel(
        selectedLocale.iso,
        selectedLocale.nativeName,
        selectedLocale.isActive,
      )
    : 'Select locale';

  const handleSelect = (locale: string) => {
    onChange(locale);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <Button
        id={id}
        type="button"
        variant="outline"
        disabled={isDisabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={labelId}
        className="h-9 w-full justify-between bg-transparent px-3 font-normal shadow-sm"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronIcon
          className="size-4 shrink-0 opacity-50"
          aria-hidden
        />
      </Button>
      {isOpen ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="max-h-48 space-y-0.5 overflow-y-auto p-1"
          >
            {locales.map((locale) => {
              const isSelected = locale.iso === value;
              const optionLabel = formatLocaleOptionLabel(
                locale.iso,
                locale.nativeName,
                locale.isActive,
              );

              return (
                <li
                  key={locale.iso}
                  role="presentation"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(locale.iso)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <Check
                      className={cn('size-3.5 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                      aria-hidden
                    />
                    <span>{optionLabel}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
