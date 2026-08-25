import AdminListSortControls from '@/app/admin/_components/AdminListSortControls';
import type { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/_lib/admin-gigs-sort';
import {
  ADMIN_GIGS_SORT_BY_LABELS,
  ADMIN_GIGS_SORT_BY_VALUES,
} from '@/app/admin/gigs/_lib/admin-gigs-sort';

interface AdminGigsSortControlsProps {
  sortBy: AdminGigsSortBy;
  sortOrder: AdminGigsSortOrder;
  onSortByChange: (sortBy: AdminGigsSortBy) => void;
  onSortOrderToggle: () => void;
}

export default function AdminGigsSortControls(props: AdminGigsSortControlsProps) {
  const options = ADMIN_GIGS_SORT_BY_VALUES.map((value) => ({
    value,
    label: ADMIN_GIGS_SORT_BY_LABELS[value],
  }));

  return (
    <AdminListSortControls
      ariaLabel="Sort gigs"
      sortBy={props.sortBy}
      sortOrder={props.sortOrder}
      options={options}
      onSortByChange={props.onSortByChange}
      onSortOrderToggle={props.onSortOrderToggle}
    />
  );
}
