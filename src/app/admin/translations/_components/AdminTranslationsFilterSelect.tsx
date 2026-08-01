'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import type { AdminTranslationFilterOption } from '@/app/admin/translations/_lib/admin-translations-filters';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AdminTranslationsFilterSelectProps {
  readonly ariaLabel: string;
  readonly triggerLabel: string;
  readonly selectedValue: string;
  readonly options: readonly AdminTranslationFilterOption[];
  readonly isDisabled: boolean;
  readonly isFirst: boolean;
  readonly onSelect: (value: string) => void;
}

export default function AdminTranslationsFilterSelect(props: AdminTranslationsFilterSelectProps) {
  const { ariaLabel, triggerLabel, selectedValue, options, isDisabled, isFirst, onSelect } = props;
  const [isOpen, setIsOpen] = useState(false);
  const ChevronIcon = isOpen ? ChevronUp : ChevronDown;

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          className={cn(
            'h-8 min-w-0 flex-1 justify-between gap-1 rounded-none px-2.5 text-xs font-normal focus-visible:z-10',
            isFirst ? 'rounded-l-md' : '-ml-px',
          )}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronIcon
            className="size-3.5 shrink-0 opacity-60"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-[var(--radix-popover-trigger-width)] p-1"
      >
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="space-y-0.5"
        >
          {options.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <li
                key={option.value}
                role="presentation"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors',
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <Check
                    className={cn('size-3.5 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                    aria-hidden
                  />
                  <span>{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
