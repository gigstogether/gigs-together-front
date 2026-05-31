'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

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
import type { AdminGigDetail, GigStatus } from '@/app/admin/gigs/types';
import { GIG_FORM_ADMIN_BASE_PATH } from '@/app/gig-form/gig-form-paths';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EMPTY_ADMIN_GIGS: readonly AdminGigDetail[] = [];

export default function AdminGigsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { filter, selectedGigId }: AdminGigsQueryState = readAdminGigsQueryState(searchParams);
  const gigs = EMPTY_ADMIN_GIGS;

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
    <div className="grid gap-6 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-start">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="space-y-2 border-b pb-2">
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

        <div className="overflow-hidden rounded-lg border sm:max-h-[calc(100dvh-11rem)] sm:overflow-y-auto">
          <AdminGigQueueList
            gigs={gigs}
            selectedId={effectiveSelectedId}
            onSelect={handleSelectGig}
            emptyMessage={getGigStatusEmptyMessage(filter)}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm sm:sticky sm:top-[calc(var(--header-h)+1.5rem)] sm:mx-0 sm:max-w-md">
        <AdminGigPreviewCard
          gig={selectedGig}
          listFilter={filter}
        />
      </div>
    </div>
  );
}
