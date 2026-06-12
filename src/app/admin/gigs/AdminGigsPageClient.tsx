'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { adminKeys } from '@/app/admin/adminKeys';
import AdminGigEditCard from '@/app/admin/gigs/_components/AdminGigEditCard';
import AdminGigPreviewCard from '@/app/admin/gigs/_components/AdminGigPreviewCard';
import AdminGigsFilterControls from '@/app/admin/gigs/_components/AdminGigsFilterControls';
import AdminGigQueueList from '@/app/admin/gigs/_components/AdminGigQueueList';
import AdminGigsSortControls from '@/app/admin/gigs/_components/AdminGigsSortControls';
import {
  buildAdminGigsPath,
  buildAdminGigsSearchParams,
  readAdminGigsQueryState,
} from '@/app/admin/gigs/admin-gigs-query';
import type { AdminGigsQueryState } from '@/app/admin/gigs/admin-gigs-query';
import type { AdminGigsSortBy } from '@/app/admin/gigs/admin-gigs-sort';
import { AdminGigsSortOrder, getDefaultAdminGigsSortBy } from '@/app/admin/gigs/admin-gigs-sort';
import { getGigStatusEmptyMessage } from '@/app/admin/gigs/types';
import type { GigStatus } from '@/app/admin/gigs/types';
import { GIG_FORM_ADMIN_BASE_PATH } from '@/app/gig-form/gig-form-paths';
import { fetchAdminGigs } from '@/lib/admin-api';
import type { Country } from '@/lib/countries.server';

interface AdminGigsPageClientProps {
  readonly countries: Country[];
}

export default function AdminGigsPageClient(props: AdminGigsPageClientProps) {
  const { countries } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { filter, selectedGigPublicId, sortBy, sortOrder, isEditing }: AdminGigsQueryState =
    readAdminGigsQueryState(searchParams);

  const gigsQuery = useQuery({
    queryKey: adminKeys.gigs(filter, sortBy, sortOrder),
    queryFn: () => fetchAdminGigs({ status: filter, sortBy, sortOrder }),
  });

  const gigs = gigsQuery.data?.gigs ?? [];

  const replaceQuery = useCallback(
    (next: AdminGigsQueryState) => {
      const params = buildAdminGigsSearchParams(next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const effectiveSelectedPublicId =
    selectedGigPublicId && gigs.some((g) => g.publicId === selectedGigPublicId)
      ? selectedGigPublicId
      : (gigs[0]?.publicId ?? null);

  const selectedGig = gigs.find((g) => g.publicId === effectiveSelectedPublicId) ?? null;

  const handleFilterChange = (next: GigStatus) => {
    replaceQuery({
      filter: next,
      selectedGigPublicId: null,
      sortBy: getDefaultAdminGigsSortBy(next),
      sortOrder,
      isEditing: false,
    });
  };

  const handleSelectGig = (publicId: string) => {
    replaceQuery({ filter, selectedGigPublicId: publicId, sortBy, sortOrder, isEditing: false });
  };

  const handleSortByChange = (nextSortBy: AdminGigsSortBy) => {
    replaceQuery({
      filter,
      selectedGigPublicId: null,
      sortBy: nextSortBy,
      sortOrder,
      isEditing: false,
    });
  };

  const handleSortOrderToggle = () => {
    replaceQuery({
      filter,
      selectedGigPublicId: null,
      sortBy,
      sortOrder:
        sortOrder === AdminGigsSortOrder.Asc ? AdminGigsSortOrder.Desc : AdminGigsSortOrder.Asc,
      isEditing: false,
    });
  };

  const previewQueryState: AdminGigsQueryState = {
    filter,
    selectedGigPublicId: effectiveSelectedPublicId,
    sortBy,
    sortOrder,
    isEditing: false,
  };
  const previewHref = buildAdminGigsPath(previewQueryState);
  const editHref = buildAdminGigsPath({ ...previewQueryState, isEditing: true });
  const isShowingEditCard = isEditing && effectiveSelectedPublicId !== null;

  return (
    <div className="grid min-h-0 gap-6 sm:h-[calc(100dvh-var(--header-h)-3rem)] sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:items-stretch">
      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="flex min-h-0 min-w-0 flex-col rounded-lg border sm:flex-1 sm:overflow-hidden">
          <AdminGigsFilterControls
            filter={filter}
            onFilterChange={handleFilterChange}
            newGigHref={`${GIG_FORM_ADMIN_BASE_PATH}/new`}
          />

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
                emptyMessage={getGigStatusEmptyMessage(filter)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-sm sm:h-full sm:min-h-0 sm:mx-0 sm:max-w-md">
        {isShowingEditCard ? (
          <AdminGigEditCard
            countries={countries}
            gigPublicId={effectiveSelectedPublicId}
            previewHref={previewHref}
          />
        ) : (
          <AdminGigPreviewCard
            gig={selectedGig}
            listFilter={filter}
            editHref={editHref}
          />
        )}
      </div>
    </div>
  );
}
