'use client';

import { useQuery } from '@tanstack/react-query';

import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminGigCard from '@/app/admin/gigs/_components/AdminGigCard';
import { fetchAdminGigByPublicId } from '@/app/admin/_lib/admin-api';

interface AdminGigDetailPageClientProps {
  readonly publicId: string;
}

export default function AdminGigDetailPageClient(props: AdminGigDetailPageClientProps) {
  const trimmedPublicId = props.publicId.trim();

  const gigQuery = useQuery({
    queryKey: adminKeys.gigByPublicId(trimmedPublicId),
    queryFn: () => fetchAdminGigByPublicId({ publicId: trimmedPublicId }),
    enabled: Boolean(trimmedPublicId),
  });

  if (!trimmedPublicId) {
    return <p className="text-sm text-destructive">Invalid gig id.</p>;
  }

  if (gigQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading gig…</p>;
  }

  if (gigQuery.isError || !gigQuery.data) {
    return <p className="text-sm text-destructive">Could not load gig.</p>;
  }

  return <AdminGigCard gig={gigQuery.data} />;
}
