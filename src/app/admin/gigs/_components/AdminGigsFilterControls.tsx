import { Plus } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import AdminStatusFilterControls from '@/app/admin/_components/AdminStatusFilterControls';
import { GIG_FILTER_STATUSES, getGigStatusLabel } from '@/app/admin/gigs/_lib/admin-gig-status';
import type { GigStatusFilter } from '@/app/admin/gigs/_lib/types';
import { Button } from '@/components/ui/button';

interface AdminGigsFilterControlsProps {
  filter: GigStatusFilter;
  onFilterChange: (status: GigStatusFilter) => void;
  newGigHref: Route;
}

export default function AdminGigsFilterControls(props: AdminGigsFilterControlsProps) {
  const { filter, onFilterChange, newGigHref } = props;
  const options = GIG_FILTER_STATUSES.map((status) => ({
    value: status,
    label: getGigStatusLabel(status),
  }));

  return (
    <AdminStatusFilterControls
      ariaLabel="Filter gigs"
      value={filter}
      options={options}
      onChange={onFilterChange}
      trailingAction={
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
      }
    />
  );
}
