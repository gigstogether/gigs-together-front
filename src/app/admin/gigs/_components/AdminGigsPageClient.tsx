'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminGigPreviewCard from '@/app/admin/gigs/_components/AdminGigPreviewCard';
import AdminGigQueueList from '@/app/admin/gigs/_components/AdminGigQueueList';
import AdminGigsSortControls from '@/app/admin/gigs/_components/AdminGigsSortControls';
import {
  buildAdminGigsSearchParams,
  getAdminGigsQueryStateOrDefaults,
} from '@/app/admin/gigs/_lib/admin-gigs-query';
import type { AdminGigsQueryState } from '@/app/admin/gigs/_lib/admin-gigs-query';
import type { AdminGigsSortBy } from '@/app/admin/gigs/_lib/admin-gigs-sort';
import { AdminGigsSortOrder } from '@/app/admin/gigs/_lib/admin-gigs-sort';
import { fetchAdminGigs } from '@/app/admin/_lib/admin-api';

export default function AdminGigsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { selectedGigPublicId, sortBy, sortOrder }: AdminGigsQueryState =
    getAdminGigsQueryStateOrDefaults(searchParams);

  const [initialQueryState] = useState<AdminGigsQueryState>(() => ({
    selectedGigPublicId,
    sortBy,
    sortOrder,
  }));

  const gigsQuery = useQuery({
    queryKey: adminKeys.gigs(sortBy, sortOrder),
    queryFn: () => fetchAdminGigs({ sortBy, sortOrder }),
  });

  const gigs = gigsQuery.data?.gigs ?? [];

  const replaceQuery = useCallback(
    (next: AdminGigsQueryState) => {
      const params = buildAdminGigsSearchParams(next);
      const query = params.toString();
      router.replace(`?${query}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    replaceQuery(initialQueryState);
    // Sync query once from URL-derived state on mount; changes go through handlers below.
  }, [initialQueryState, replaceQuery]);

  const effectiveSelectedPublicId =
    selectedGigPublicId && gigs.some((g) => g.publicId === selectedGigPublicId)
      ? selectedGigPublicId
      : (gigs[0]?.publicId ?? null);

  const selectedGig = gigs.find((g) => g.publicId === effectiveSelectedPublicId) ?? null;

  const handleSelectGig = (publicId: string) => {
    replaceQuery({ selectedGigPublicId: publicId, sortBy, sortOrder });
  };

  const handleSortByChange = (nextSortBy: AdminGigsSortBy) => {
    replaceQuery({
      selectedGigPublicId: null,
      sortBy: nextSortBy,
      sortOrder,
    });
  };

  const handleSortOrderToggle = () => {
    replaceQuery({
      selectedGigPublicId: null,
      sortBy,
      sortOrder:
        sortOrder === AdminGigsSortOrder.Asc ? AdminGigsSortOrder.Desc : AdminGigsSortOrder.Asc,
    });
  };

  return (
    <div className="grid min-h-0 gap-6 sm:h-[calc(100dvh-var(--header-h)-3rem)] sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:items-stretch">
      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="flex min-h-0 min-w-0 flex-col rounded-lg border sm:flex-1 sm:overflow-hidden">
          <AdminGigsSortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={handleSortByChange}
            onSortOrderToggle={handleSortOrderToggle}
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {gigsQuery.isError ? (
              <p className="px-3 py-10 text-center text-sm text-destructive">
                Could not load gigs.
              </p>
            ) : gigsQuery.isLoading ? (
              <p className="px-3 py-10 text-center text-sm text-muted-foreground">Loading gigs…</p>
            ) : (
              <AdminGigQueueList
                gigs={gigs}
                selectedPublicId={effectiveSelectedPublicId}
                onSelect={handleSelectGig}
                emptyMessage="No gigs."
              />
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-sm sm:h-full sm:min-h-0 sm:mx-0 sm:max-w-md">
        <AdminGigPreviewCard gig={selectedGig} />
      </div>
    </div>
  );
}
