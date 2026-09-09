'use client';

import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { fetchAdminGigCandidateById } from '@/app/admin/_lib/admin-api';
import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminGigCandidateBackLink from '@/app/admin/gig-candidates/_components/AdminGigCandidateBackLink';
import AdminGigCandidateCard from '@/app/admin/gig-candidates/_components/AdminGigCandidateCard';
import AdminGigCandidateDraftForm from '@/app/admin/gig-candidates/_components/AdminGigCandidateDraftForm';
import { GigCandidateStatusAPI } from '@/app/admin/gig-candidates/_lib/admin-gig-candidate';
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

  let content: ReactNode;

  if (!gigCandidateId) {
    content = <p className="text-sm text-destructive">Invalid Gig Candidate id.</p>;
  } else if (gigCandidateQuery.isLoading) {
    content = <p className="text-sm text-muted-foreground">Loading Gig Candidate…</p>;
  } else if (gigCandidateQuery.isError || !gigCandidateQuery.data) {
    content = <p className="text-sm text-destructive">Could not load Gig Candidate.</p>;
  } else if (props.mode === 'view') {
    content = <AdminGigCandidateCard gigCandidate={gigCandidateQuery.data} />;
  } else if (gigCandidateQuery.data.status !== GigCandidateStatusAPI.Reviewing) {
    content = (
      <p className="text-sm text-destructive">Only Reviewing Gig Candidates can be edited.</p>
    );
  } else {
    const gigCandidate = gigCandidateQuery.data;

    content = (
      <AdminGigCandidateDraftForm
        key={`${gigCandidate.id}:${gigCandidate.version}`}
        countries={props.countries}
        gigCandidate={gigCandidate}
      />
    );
  }

  return (
    <>
      <AdminGigCandidateBackLink gigCandidateStatus={gigCandidateQuery.data?.status} />
      {content}
    </>
  );
}
