export const ADMIN_GIGS_SORT_BY_VALUES = ['post_date'] as const;

export type AdminGigsSortBy = (typeof ADMIN_GIGS_SORT_BY_VALUES)[number];

export const ADMIN_GIGS_SORT_ORDER_VALUES = ['asc', 'desc'] as const;

export type AdminGigsSortOrder = (typeof ADMIN_GIGS_SORT_ORDER_VALUES)[number];

export const ADMIN_GIGS_DEFAULT_SORT_BY: AdminGigsSortBy = 'post_date';

export const ADMIN_GIGS_DEFAULT_SORT_ORDER: AdminGigsSortOrder = 'desc';

export const ADMIN_GIGS_SORT_BY_LABELS: Record<AdminGigsSortBy, string> = {
  post_date: 'Post date',
};

export function isAdminGigsSortBy(value: string): value is AdminGigsSortBy {
  return (ADMIN_GIGS_SORT_BY_VALUES as readonly string[]).includes(value);
}

export function isAdminGigsSortOrder(value: string): value is AdminGigsSortOrder {
  return (ADMIN_GIGS_SORT_ORDER_VALUES as readonly string[]).includes(value);
}

export function parseAdminGigsSortByFromQuery(value: string | null): AdminGigsSortBy {
  if (value && isAdminGigsSortBy(value)) {
    return value;
  }
  return ADMIN_GIGS_DEFAULT_SORT_BY;
}

export function parseAdminGigsSortOrderFromQuery(value: string | null): AdminGigsSortOrder {
  if (value && isAdminGigsSortOrder(value)) {
    return value;
  }
  return ADMIN_GIGS_DEFAULT_SORT_ORDER;
}

export function getAdminGigsSortOrderLabel(order: AdminGigsSortOrder): string {
  return order === 'asc' ? 'Oldest first' : 'Newest first';
}

export function getAdminGigsSortOrderShortLabel(order: AdminGigsSortOrder): string {
  return order === 'asc' ? 'Oldest' : 'Newest';
}
