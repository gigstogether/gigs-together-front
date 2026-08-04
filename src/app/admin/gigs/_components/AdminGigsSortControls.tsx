'use client';

import { useState } from 'react';
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import type { AdminGigsSortBy } from '@/app/admin/gigs/_lib/admin-gigs-sort';
import {
  AdminGigsSortOrder,
  ADMIN_GIGS_SORT_BY_LABELS,
  ADMIN_GIGS_SORT_BY_VALUES,
  ADMIN_GIGS_SORT_ORDER_VALUES,
  getAdminGigsSortOrderLabel,
  getAdminGigsSortOrderShortLabel,
} from '@/app/admin/gigs/_lib/admin-gigs-sort';
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
  const SortByChevronIcon = isSortMenuOpen ? ChevronUp : ChevronDown;

  const handleSortBySelect = (nextSortBy: AdminGigsSortBy) => {
    if (nextSortBy === sortBy) {
      setIsSortMenuOpen(false);
      return;
    }
    onSortByChange(nextSortBy);
    setIsSortMenuOpen(false);
  };

  return (
    <div
      className="shrink-0 border-b bg-muted/20 px-2 pt-1 pb-2"
      aria-label="Sort gigs"
    >
      <div className="flex min-w-0 w-full">
        <Popover
          open={isSortMenuOpen}
          onOpenChange={setIsSortMenuOpen}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 min-w-0 flex-1 justify-between gap-1 rounded-none rounded-l-md px-2.5 text-xs font-normal focus-visible:z-10"
              aria-label="Sort gigs by"
              aria-expanded={isSortMenuOpen}
            >
              <span className="truncate">{ADMIN_GIGS_SORT_BY_LABELS[sortBy]}</span>
              <SortByChevronIcon
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
          <span className="inline-grid">
            {ADMIN_GIGS_SORT_ORDER_VALUES.map((order) => (
              <span
                key={order}
                className={cn('col-start-1 row-start-1', order !== sortOrder && 'invisible')}
                aria-hidden={order !== sortOrder}
              >
                {getAdminGigsSortOrderShortLabel(order)}
              </span>
            ))}
          </span>
        </Button>
      </div>
    </div>
  );
}
