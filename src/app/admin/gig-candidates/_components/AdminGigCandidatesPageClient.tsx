'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';

import { fetchAdminGigCandidates } from '@/app/admin/_lib/admin-api';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminGigCandidatePreviewCard from '@/app/admin/gig-candidates/_components/AdminGigCandidatePreviewCard';
import AdminGigCandidateQueueList from '@/app/admin/gig-candidates/_components/AdminGigCandidateQueueList';
import AdminGigCandidatesFilterControls from '@/app/admin/gig-candidates/_components/AdminGigCandidatesFilterControls';
import AdminGigCandidatesSortControls from '@/app/admin/gig-candidates/_components/AdminGigCandidatesSortControls';
import {
  ADMIN_GIG_CANDIDATES_DEFAULT_SORT_BY,
  AdminGigCandidatesSortOrder,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
import type { AdminGigCandidatesQueryState } from '@/app/admin/gig-candidates/_lib/admin-gig-candidates-query';
import {
  buildAdminGigCandidatesSearchParams,
  getAdminGigCandidatesQueryStateOrDefaults,
} from '@/app/admin/gig-candidates/_lib/admin-gig-candidates-query';
import { GIG_CANDIDATE_EMPTY_MESSAGES } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate-status';
import { Button } from '@/components/ui/button';
import { ADMIN_GIG_CANDIDATE_NEW_ROUTE } from '@/lib/admin-gig-candidate-paths';

export default function AdminGigCandidatesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();
  const state = getAdminGigCandidatesQueryStateOrDefaults(searchParams);
  const { filter, selectedGigCandidateId, sortBy, sortOrder } = state;

  const gigCandidatesQuery = useQuery({
    queryKey: adminKeys.gigCandidates(filter, sortBy, sortOrder),
    queryFn: () => fetchAdminGigCandidates({ status: filter, sortBy, sortOrder }),
  });
  const gigCandidates = gigCandidatesQuery.data?.gigCandidates ?? [];

  const replaceQuery = useCallback(
    (nextState: AdminGigCandidatesQueryState) => {
      const query = buildAdminGigCandidatesSearchParams(nextState).toString();
      if (query === currentQuery) {
        return;
      }
      router.replace(`?${query}`, { scroll: false });
    },
    [currentQuery, router],
  );

  useEffect(() => {
    replaceQuery({ filter, selectedGigCandidateId, sortBy, sortOrder });
  }, [filter, replaceQuery, selectedGigCandidateId, sortBy, sortOrder]);

  const effectiveSelectedGigCandidateId =
    selectedGigCandidateId &&
    gigCandidates.some((gigCandidate) => gigCandidate.id === selectedGigCandidateId)
      ? selectedGigCandidateId
      : (gigCandidates[0]?.id ?? null);
  const selectedGigCandidate =
    gigCandidates.find((gigCandidate) => gigCandidate.id === effectiveSelectedGigCandidateId) ??
    null;

  return (
    <div className="grid min-h-0 gap-6 sm:h-[calc(100dvh-var(--header-h)-3rem)] sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:items-stretch">
      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="flex min-h-0 min-w-0 flex-col rounded-lg border sm:flex-1 sm:overflow-hidden">
          <AdminGigCandidatesFilterControls
            filter={filter}
            onFilterChange={(nextFilter) =>
              replaceQuery({
                filter: nextFilter,
                selectedGigCandidateId: null,
                sortBy: ADMIN_GIG_CANDIDATES_DEFAULT_SORT_BY,
                sortOrder,
              })
            }
            trailingAction={
              <Button
                asChild
                size="icon"
                className="h-8 w-8 shrink-0 bg-black text-white hover:bg-black/90"
              >
                <Link
                  href={ADMIN_GIG_CANDIDATE_NEW_ROUTE}
                  aria-label="Create Gig Candidate"
                  title="Create Gig Candidate"
                >
                  <Plus
                    className="h-4 w-4"
                    aria-hidden
                  />
                </Link>
              </Button>
            }
          />
          <AdminGigCandidatesSortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={(nextSortBy) =>
              replaceQuery({
                filter,
                selectedGigCandidateId: null,
                sortBy: nextSortBy,
                sortOrder,
              })
            }
            onSortOrderToggle={() =>
              replaceQuery({
                filter,
                selectedGigCandidateId: null,
                sortBy,
                sortOrder:
                  sortOrder === AdminGigCandidatesSortOrder.Asc
                    ? AdminGigCandidatesSortOrder.Desc
                    : AdminGigCandidatesSortOrder.Asc,
              })
            }
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {gigCandidatesQuery.isError ? (
              <p className="px-3 py-10 text-center text-sm text-destructive">
                Could not load gig candidates.
              </p>
            ) : gigCandidatesQuery.isLoading ? (
              <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                Loading gig candidates…
              </p>
            ) : (
              <AdminGigCandidateQueueList
                gigCandidates={gigCandidates}
                selectedGigCandidateId={effectiveSelectedGigCandidateId}
                onSelect={(gigCandidateId) =>
                  replaceQuery({
                    ...state,
                    selectedGigCandidateId: gigCandidateId,
                  })
                }
                emptyMessage={GIG_CANDIDATE_EMPTY_MESSAGES[filter]}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-sm sm:h-full sm:min-h-0 sm:mx-0 sm:max-w-md">
        <AdminGigCandidatePreviewCard gigCandidate={selectedGigCandidate} />
      </div>
    </div>
  );
}
