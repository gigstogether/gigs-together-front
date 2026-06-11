'use client';

import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';

import {
  ADMIN_GIGS_SORT_BY_LABELS,
  ADMIN_GIGS_SORT_BY_VALUES,
  getAdminGigsSortOrderLabel,
  getAdminGigsSortOrderShortLabel,
  isAdminGigsSortBy,
} from '@/app/admin/gigs/admin-gigs-sort';
import type { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminGigsSortControlsProps {
  readonly sortBy: AdminGigsSortBy;
  readonly sortOrder: AdminGigsSortOrder;
  readonly onSortByChange: (sortBy: AdminGigsSortBy) => void;
  readonly onSortOrderToggle: () => void;
}

export default function AdminGigsSortControls(props: AdminGigsSortControlsProps) {
  const { sortBy, sortOrder, onSortByChange, onSortOrderToggle } = props;
  const hasMultipleSortOptions = ADMIN_GIGS_SORT_BY_VALUES.length > 1;
  const SortOrderIcon = sortOrder === 'asc' ? ArrowUpWideNarrow : ArrowDownWideNarrow;
  const sortOrderLabel = getAdminGigsSortOrderLabel(sortOrder);
  const sortOrderShortLabel = getAdminGigsSortOrderShortLabel(sortOrder);

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-muted/20 px-3 py-1.5">
      <div className="min-w-0">
        {hasMultipleSortOptions ? (
          <>
            <label
              htmlFor="admin-gigs-sort-by"
              className="sr-only"
            >
              Sort gigs by
            </label>
            <select
              id="admin-gigs-sort-by"
              value={sortBy}
              onChange={(event) => {
                const nextValue = event.target.value;
                if (!isAdminGigsSortBy(nextValue) || nextValue === sortBy) {
                  return;
                }
                onSortByChange(nextValue);
              }}
              className={cn(
                'h-7 max-w-full truncate border-0 bg-transparent py-0 pl-0 pr-6 text-xs font-medium',
                'text-foreground focus-visible:outline-none focus-visible:ring-0',
              )}
            >
              {ADMIN_GIGS_SORT_BY_VALUES.map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {ADMIN_GIGS_SORT_BY_LABELS[value]}
                </option>
              ))}
            </select>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            Sorted by {ADMIN_GIGS_SORT_BY_LABELS[sortBy].toLowerCase()}
          </span>
        )}
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 shrink-0 gap-1 px-2 text-xs font-medium"
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
