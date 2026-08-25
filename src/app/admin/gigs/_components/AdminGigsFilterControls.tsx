import { Plus } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import { GIG_FILTER_STATUSES, getGigStatusLabel } from '@/app/admin/gigs/_lib/admin-gig-status';
import type { GigStatusFilter } from '@/app/admin/gigs/_lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminGigsFilterControlsProps {
  filter: GigStatusFilter;
  onFilterChange: (status: GigStatusFilter) => void;
  newGigHref: Route;
}

export default function AdminGigsFilterControls(props: AdminGigsFilterControlsProps) {
  const { filter, onFilterChange, newGigHref } = props;
  return (
    <nav
      className="shrink-0 bg-muted/20 px-2 pb-1 pt-2"
      aria-label="Filter gigs"
    >
      <div className="flex min-w-0 w-full">
        {GIG_FILTER_STATUSES.map((status, index) => {
          const isActive = filter === status;

          return (
            <Button
              key={status}
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={isActive}
              onClick={() => onFilterChange(status)}
              className={cn(
                'h-8 min-w-0 flex-1 rounded-none px-1 text-xs font-normal focus-visible:z-10',
                index === 0 && 'rounded-l-md',
                index > 0 && '-ml-px',
                isActive && 'z-[1] bg-accent text-accent-foreground',
              )}
            >
              {getGigStatusLabel(status)}
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
