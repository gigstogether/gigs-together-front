import AdminListSortControls from '@/app/admin/_components/AdminListSortControls';
import {
  ADMIN_GIG_CANDIDATES_SORT_BY_LABELS,
  ADMIN_GIG_CANDIDATES_SORT_BY_VALUES,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import type {
  AdminGigCandidatesSortBy,
  AdminGigCandidatesSortOrder,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';

interface AdminGigCandidatesSortControlsProps {
  sortBy: AdminGigCandidatesSortBy;
  sortOrder: AdminGigCandidatesSortOrder;
  onSortByChange: (sortBy: AdminGigCandidatesSortBy) => void;
  onSortOrderToggle: () => void;
}

export default function AdminGigCandidatesSortControls(props: AdminGigCandidatesSortControlsProps) {
  const options = ADMIN_GIG_CANDIDATES_SORT_BY_VALUES.map((value) => ({
    value,
    label: ADMIN_GIG_CANDIDATES_SORT_BY_LABELS[value],
  }));

  return (
    <AdminListSortControls
      ariaLabel="Sort gig candidates"
      sortBy={props.sortBy}
      sortOrder={props.sortOrder}
      options={options}
      onSortByChange={props.onSortByChange}
      onSortOrderToggle={props.onSortOrderToggle}
    />
  );
}
