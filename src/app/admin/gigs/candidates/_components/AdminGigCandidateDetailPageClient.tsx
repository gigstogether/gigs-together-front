'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAdminGigCandidateById } from '@/app/admin/_lib/admin-api';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminGigCandidateCard from '@/app/admin/gigs/candidates/_components/AdminGigCandidateCard';
import AdminGigCandidateDraftForm from '@/app/admin/gigs/candidates/_components/AdminGigCandidateDraftForm';
import { GigCandidateStatusAPI } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import type { Country } from '@/lib/api-boundary-schemas';

interface AdminGigCandidateViewPageClientProps {
  mode: 'view';
  gigCandidateId: string;
}

interface AdminGigCandidateEditPageClientProps {
  mode: 'edit';
  countries: Country[];
  gigCandidateId: string;
}

type AdminGigCandidateDetailPageClientProps =
  | AdminGigCandidateViewPageClientProps
  | AdminGigCandidateEditPageClientProps;

export default function AdminGigCandidateDetailPageClient(
  props: AdminGigCandidateDetailPageClientProps,
) {
  const gigCandidateId = props.gigCandidateId.trim();
  const gigCandidateQuery = useQuery({
    queryKey: adminKeys.gigCandidateById(gigCandidateId),
    queryFn: ({ signal }) => fetchAdminGigCandidateById({ gigCandidateId, signal }),
    enabled: gigCandidateId.length > 0,
  });

  if (!gigCandidateId) {
    return <p className="text-sm text-destructive">Invalid Gig Candidate id.</p>;
  }
  if (gigCandidateQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading Gig Candidate…</p>;
  }
  if (gigCandidateQuery.isError || !gigCandidateQuery.data) {
    return <p className="text-sm text-destructive">Could not load Gig Candidate.</p>;
  }

  const gigCandidate = gigCandidateQuery.data;

  if (props.mode === 'view') {
    return (
      <AdminGigCandidateCard
        gigCandidate={gigCandidate}
        isRejectActionVisible={false}
      />
    );
  }

  if (gigCandidate.status !== GigCandidateStatusAPI.Reviewing) {
    return <p className="text-sm text-destructive">Only Reviewing Gig Candidates can be edited.</p>;
  }

  return (
    <AdminGigCandidateDraftForm
      key={`${gigCandidate.id}:${gigCandidate.version}`}
      countries={props.countries}
      gigCandidate={gigCandidate}
    />
  );
}
