'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { adminKeys } from '@/app/admin/adminKeys';
import AdminGigPreviewCard from '@/app/admin/gigs/_components/AdminGigPreviewCard';
import AdminGigQueueList from '@/app/admin/gigs/_components/AdminGigQueueList';
import {
  buildAdminGigsSearchParams,
  readAdminGigsQueryState,
} from '@/app/admin/gigs/admin-gigs-query';
import type { AdminGigsQueryState } from '@/app/admin/gigs/admin-gigs-query';
import {
  GIG_FILTER_STATUSES,
  getGigStatusEmptyMessage,
  getGigStatusLabel,
} from '@/app/admin/gigs/types';
import type { GigStatus } from '@/app/admin/gigs/types';
import { GIG_FORM_ADMIN_BASE_PATH } from '@/app/gig-form/gig-form-paths';
import { Button } from '@/components/ui/button';
import { fetchAdminGigs } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

export default function AdminGigsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { filter, selectedGigId }: AdminGigsQueryState = readAdminGigsQueryState(searchParams);

  const gigsQuery = useQuery({
    queryKey: adminKeys.gigs(filter),
    queryFn: () => fetchAdminGigs({ status: filter }),
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

  const effectiveSelectedId =
    selectedGigId && gigs.some((g) => g.id === selectedGigId)
      ? selectedGigId
      : (gigs[0]?.id ?? null);

  const selectedGig = gigs.find((g) => g.id === effectiveSelectedId) ?? null;

  const handleFilterChange = (next: GigStatus) => {
    replaceQuery({ filter: next, selectedGigId: null });
  };

  const handleSelectGig = (id: string) => {
    replaceQuery({ filter, selectedGigId: id });
  };

  return (
    <div className="grid min-h-0 gap-6 sm:h-[calc(100dvh-var(--header-h)-3rem)] sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-stretch">
      <div className="flex min-h-0 min-w-0 flex-col gap-3">
        <div className="shrink-0 space-y-2 border-b pb-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Link href={`${GIG_FORM_ADMIN_BASE_PATH}/new`}>New gig</Link>
          </Button>
          <nav
            className="flex flex-wrap gap-x-4 gap-y-1 text-sm"
            aria-label="Filter gigs"
          >
            {GIG_FILTER_STATUSES.map((gigStatus) => (
              <button
                key={gigStatus}
                type="button"
                onClick={() => handleFilterChange(gigStatus)}
                className={cn(
                  '-mb-px border-b-2 py-1 transition-colors',
                  filter === gigStatus
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {getGigStatusLabel(gigStatus)}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-0 rounded-lg border sm:flex-1 sm:overflow-y-auto">
          {gigsQuery.isError ? (
            <p className="px-3 py-10 text-center text-sm text-destructive">Could not load gigs.</p>
          ) : gigsQuery.isLoading ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">Loading gigs…</p>
          ) : (
            <AdminGigQueueList
              gigs={gigs}
              selectedId={effectiveSelectedId}
              onSelect={handleSelectGig}
              emptyMessage={getGigStatusEmptyMessage(filter)}
            />
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-sm sm:h-full sm:min-h-0 sm:mx-0 sm:max-w-md">
        <AdminGigPreviewCard
          gig={selectedGig}
          listFilter={filter}
        />
      </div>
    </div>
  );
}
