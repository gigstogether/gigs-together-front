'use client';

import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AdminListDropdownOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface AdminListDropdownProps<TValue extends string> {
  ariaLabel: string;
  value: TValue;
  options: readonly AdminListDropdownOption<TValue>[];
  onChange: (value: TValue) => void;
  triggerClassName?: string;
}

export default function AdminListDropdown<TValue extends string>(
  props: AdminListDropdownProps<TValue>,
) {
  const { ariaLabel, value, options, onChange, triggerClassName } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const ChevronIcon = isMenuOpen ? ChevronUp : ChevronDown;

  if (!selectedOption) {
    throw new Error(`Unsupported admin list dropdown value: ${value}`);
  }

  function handleSelect(nextValue: TValue) {
    if (nextValue !== value) {
      onChange(nextValue);
    }
    setIsMenuOpen(false);
  }

  return (
    <Popover
      open={isMenuOpen}
      onOpenChange={setIsMenuOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            'h-8 min-w-0 flex-1 justify-between gap-1 px-2.5 text-xs font-normal focus-visible:z-10',
            triggerClassName,
          )}
          aria-label={ariaLabel}
          aria-expanded={isMenuOpen}
        >
          <span className="truncate">{selectedOption.label}</span>
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
            const isSelected = option.value === value;
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
