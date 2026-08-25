'use client';

import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AdminListSortOption<TSortBy extends string> {
  value: TSortBy;
  label: string;
}

interface AdminListSortControlsProps<TSortBy extends string> {
  ariaLabel: string;
  sortBy: TSortBy;
  sortOrder: 'asc' | 'desc';
  options: readonly AdminListSortOption<TSortBy>[];
  onSortByChange: (sortBy: TSortBy) => void;
  onSortOrderToggle: () => void;
}

export default function AdminListSortControls<TSortBy extends string>(
  props: AdminListSortControlsProps<TSortBy>,
) {
  const { ariaLabel, sortBy, sortOrder, options, onSortByChange, onSortOrderToggle } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === sortBy);
  const SortOrderIcon = sortOrder === 'asc' ? ArrowUpWideNarrow : ArrowDownWideNarrow;
  const sortOrderLabel = sortOrder === 'asc' ? 'Oldest first' : 'Newest first';
  const ChevronIcon = isMenuOpen ? ChevronUp : ChevronDown;

  if (!selectedOption) {
    throw new Error(`Unsupported admin list sort value: ${sortBy}`);
  }

  function handleSortBySelect(nextSortBy: TSortBy) {
    if (nextSortBy !== sortBy) {
      onSortByChange(nextSortBy);
    }
    setIsMenuOpen(false);
  }

  return (
    <div
      className="shrink-0 border-b bg-muted/20 px-2 pt-1 pb-2"
      aria-label={ariaLabel}
    >
      <div className="flex min-w-0 w-full">
        <Popover
          open={isMenuOpen}
          onOpenChange={setIsMenuOpen}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 min-w-0 flex-1 justify-between gap-1 rounded-none rounded-l-md px-2.5 text-xs font-normal focus-visible:z-10"
              aria-label={`${ariaLabel} by`}
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
              aria-label={`${ariaLabel} by`}
              className="space-y-0.5"
            >
              {options.map((option) => {
                const isSelected = option.value === sortBy;

                return (
                  <li
                    key={option.value}
                    role="presentation"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSortBySelect(option.value)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors',
                        isSelected
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <Check
                        className={cn(
                          'size-3.5 shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
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
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 shrink-0 -ml-px gap-1 rounded-l-none rounded-r-md px-2.5 text-xs font-normal focus-visible:z-10"
          aria-label={`Sort order: ${sortOrderLabel}`}
          title={sortOrderLabel}
          onClick={onSortOrderToggle}
        >
          <SortOrderIcon className="size-3.5 shrink-0" />
          <span>{sortOrder === 'asc' ? 'Oldest' : 'Newest'}</span>
        </Button>
      </div>
    </div>
  );
}
