'use client';

import { useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Check, ChevronDown } from 'lucide-react';

import type { AdminGigsSortBy } from '@/app/admin/gigs/admin-gigs-sort';
import {
  AdminGigsSortOrder,
  ADMIN_GIGS_SORT_BY_LABELS,
  ADMIN_GIGS_SORT_BY_VALUES,
  getAdminGigsSortOrderLabel,
  getAdminGigsSortOrderShortLabel,
} from '@/app/admin/gigs/admin-gigs-sort';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AdminGigsSortControlsProps {
  readonly sortBy: AdminGigsSortBy;
  readonly sortOrder: AdminGigsSortOrder;
  readonly onSortByChange: (sortBy: AdminGigsSortBy) => void;
  readonly onSortOrderToggle: () => void;
}

export default function AdminGigsSortControls(props: AdminGigsSortControlsProps) {
  const { sortBy, sortOrder, onSortByChange, onSortOrderToggle } = props;
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const SortOrderIcon =
    sortOrder === AdminGigsSortOrder.Asc ? ArrowUpWideNarrow : ArrowDownWideNarrow;
  const sortOrderLabel = getAdminGigsSortOrderLabel(sortOrder);
  const sortOrderShortLabel = getAdminGigsSortOrderShortLabel(sortOrder);

  const handleSortBySelect = (nextSortBy: AdminGigsSortBy) => {
    if (nextSortBy === sortBy) {
      setIsSortMenuOpen(false);
      return;
    }
    onSortByChange(nextSortBy);
    setIsSortMenuOpen(false);
  };

  return (
    <div className="flex shrink-0 items-center gap-2 border-b bg-muted/20 px-3 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Popover
          open={isSortMenuOpen}
          onOpenChange={setIsSortMenuOpen}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 min-w-0 flex-1 justify-between gap-1 px-2.5 text-xs font-normal"
              aria-label="Sort gigs by"
            >
              <span className="truncate">{ADMIN_GIGS_SORT_BY_LABELS[sortBy]}</span>
              <ChevronDown
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
              aria-label="Sort gigs by"
              className="space-y-0.5"
            >
              {ADMIN_GIGS_SORT_BY_VALUES.map((value) => {
                const isSelected = value === sortBy;
                return (
                  <li
                    key={value}
                    role="presentation"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSortBySelect(value)}
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
                      <span>{ADMIN_GIGS_SORT_BY_LABELS[value]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 shrink-0 gap-1 px-2.5 text-xs font-normal"
        aria-label={`Sort order: ${sortOrderLabel}`}
        title={sortOrderLabel}
        onClick={onSortOrderToggle}
      >
        <SortOrderIcon className="size-3.5 shrink-0" />
        <span>{sortOrderShortLabel}</span>
      </Button>
    </div>
  );
}
