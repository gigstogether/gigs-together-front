export enum AdminGigsSortBy {
  CreatedAt = 'createdAt',
  EventDate = 'eventDate',
}

export enum AdminGigsSortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export const ADMIN_GIGS_SORT_BY_VALUES = [
  AdminGigsSortBy.CreatedAt,
  AdminGigsSortBy.EventDate,
] as const;

export const ADMIN_GIGS_SORT_ORDER_VALUES = [
  AdminGigsSortOrder.Asc,
  AdminGigsSortOrder.Desc,
] as const;

export const ADMIN_GIGS_DEFAULT_SORT_ORDER = AdminGigsSortOrder.Desc;
export const ADMIN_GIGS_DEFAULT_SORT_BY = AdminGigsSortBy.CreatedAt;

export const ADMIN_GIGS_SORT_BY_LABELS: Record<AdminGigsSortBy, string> = {
  [AdminGigsSortBy.CreatedAt]: 'Created',
  [AdminGigsSortBy.EventDate]: 'Event date',
};

export function isAdminGigsSortBy(value: string): value is AdminGigsSortBy {
  return ADMIN_GIGS_SORT_BY_VALUES.some((candidate) => candidate === value);
}

export function isAdminGigsSortOrder(value: string): value is AdminGigsSortOrder {
  return ADMIN_GIGS_SORT_ORDER_VALUES.some((candidate) => candidate === value);
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
  return order === AdminGigsSortOrder.Asc ? 'Oldest first' : 'Newest first';
}

export function getAdminGigsSortOrderShortLabel(order: AdminGigsSortOrder): string {
  return order === AdminGigsSortOrder.Asc ? 'Oldest' : 'Newest';
}
