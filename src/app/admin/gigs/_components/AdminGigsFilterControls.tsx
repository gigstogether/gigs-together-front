import type { Route } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { GIG_FILTER_STATUSES, getGigStatusLabel } from '@/app/admin/gigs/_lib/admin-gig-status';
import type { GigStatusFilter } from '@/app/admin/gigs/_lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminGigsFilterControlsProps {
  readonly filter: GigStatusFilter;
  readonly onFilterChange: (status: GigStatusFilter) => void;
  readonly newGigHref: Route;
}

export default function AdminGigsFilterControls(props: AdminGigsFilterControlsProps) {
  const { filter, onFilterChange, newGigHref } = props;

  return (
    <nav
      className="shrink-0 bg-muted/20 px-2 pt-2 pb-1"
      aria-label="Filter gigs"
    >
      <div className="flex min-w-0 w-full">
        {GIG_FILTER_STATUSES.map((gigStatus, index) => {
          const isActive = filter === gigStatus;
          const isFirst = index === 0;

          return (
            <Button
              key={gigStatus}
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={isActive}
              onClick={() => onFilterChange(gigStatus)}
              className={cn(
                'h-8 min-w-0 flex-1 rounded-none px-1 text-xs font-normal focus-visible:z-10',
                isFirst ? 'rounded-l-md' : '-ml-px',
                isActive && 'z-[1] bg-accent text-accent-foreground',
              )}
            >
              {getGigStatusLabel(gigStatus)}
            </Button>
          );
        })}
        <Button
          asChild
          size="icon"
          variant="outline"
          className="h-8 w-8 shrink-0 -ml-px rounded-l-none rounded-r-md focus-visible:z-10"
          title="New gig"
        >
          <Link href={newGigHref}>
            <Plus aria-hidden />
            <span className="sr-only">New gig</span>
          </Link>
        </Button>
      </div>
    </nav>
  );
}
