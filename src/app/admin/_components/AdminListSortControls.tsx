'use client';

import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';

import AdminListDropdown from '@/app/admin/_components/AdminListDropdown';
import { Button } from '@/components/ui/button';

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
  const SortOrderIcon = sortOrder === 'asc' ? ArrowUpWideNarrow : ArrowDownWideNarrow;
  const sortOrderLabel = sortOrder === 'asc' ? 'Oldest first' : 'Newest first';

  return (
    <div
      className="shrink-0 border-b bg-muted/20 px-2 pt-1 pb-2"
      aria-label={ariaLabel}
    >
      <div className="flex min-w-0 w-full">
        <AdminListDropdown
          ariaLabel={`${ariaLabel} by`}
          value={sortBy}
          options={options}
          onChange={onSortByChange}
          triggerClassName="rounded-none rounded-l-md"
        />
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
