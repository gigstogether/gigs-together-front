import type { ReactNode } from 'react';

import {
  GIG_CANDIDATE_STATUS_FILTERS,
  GIG_CANDIDATE_STATUS_DOT_CLASS_NAMES,
  GIG_CANDIDATE_STATUS_LABELS,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate-status';
import {
  GigCandidateStatusAPI,
  GigCandidateStatusFilter,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminGigCandidatesFilterControlsProps {
  filter: GigCandidateStatusFilter;
  onFilterChange: (status: GigCandidateStatusFilter) => void;
  trailingAction: ReactNode;
}

const GIG_CANDIDATE_STATUS_API_BY_FILTER: Record<GigCandidateStatusFilter, GigCandidateStatusAPI> =
  {
    [GigCandidateStatusFilter.Pending]: GigCandidateStatusAPI.Pending,
    [GigCandidateStatusFilter.Reviewing]: GigCandidateStatusAPI.Reviewing,
    [GigCandidateStatusFilter.Approved]: GigCandidateStatusAPI.Approved,
    [GigCandidateStatusFilter.Rejected]: GigCandidateStatusAPI.Rejected,
  };

export default function AdminGigCandidatesFilterControls(
  props: AdminGigCandidatesFilterControlsProps,
) {
  return (
    <nav
      className="shrink-0 bg-muted/20 px-2 pb-1 pt-2"
      aria-label="Filter Gig Candidates"
    >
      <div className="flex min-w-0 w-full items-center gap-2">
        <div className="flex min-w-0 flex-1">
          {GIG_CANDIDATE_STATUS_FILTERS.map((gigCandidateStatus, index) => {
            const label = GIG_CANDIDATE_STATUS_LABELS[gigCandidateStatus];
            const isActive = props.filter === gigCandidateStatus;
            const hasText =
              gigCandidateStatus === GigCandidateStatusFilter.Pending ||
              gigCandidateStatus === GigCandidateStatusFilter.Reviewing;
            const statusDotClassName =
              GIG_CANDIDATE_STATUS_DOT_CLASS_NAMES[
                GIG_CANDIDATE_STATUS_API_BY_FILTER[gigCandidateStatus]
              ];

            return (
              <Button
                key={gigCandidateStatus}
                type="button"
                variant="outline"
                size="sm"
                aria-label={label}
                aria-pressed={isActive}
                title={hasText ? undefined : label}
                onClick={() => props.onFilterChange(gigCandidateStatus)}
                className={cn(
                  'h-8 min-w-0 rounded-none text-xs font-normal focus-visible:z-10',
                  hasText ? 'flex-1 px-1' : 'w-8 shrink-0 px-0',
                  index === 0 && 'rounded-l-md',
                  index > 0 && '-ml-px',
                  index === GIG_CANDIDATE_STATUS_FILTERS.length - 1 && 'rounded-r-md',
                  isActive && 'z-[1] bg-accent text-accent-foreground',
                )}
              >
                <span
                  aria-hidden
                  className={cn('inline-block h-1.5 w-1.5 rounded-full', statusDotClassName)}
                />
                {hasText ? label : null}
              </Button>
            );
          })}
        </div>
        {props.trailingAction}
      </div>
    </nav>
  );
}
