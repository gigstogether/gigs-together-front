import { GigStatus, GigStatusAPI } from '@/app/admin/gigs/types';

export const GIG_FILTER_STATUSES: readonly GigStatus[] = [
  GigStatus.Pending,
  GigStatus.Approved,
  GigStatus.Rejected,
];

export const GIG_STATUS_LABELS: Record<GigStatus, string> = {
  [GigStatus.Pending]: 'Pending',
  [GigStatus.Approved]: 'Approved',
  [GigStatus.Rejected]: 'Rejected',
};

export const GIG_STATUS_EMPTY_MESSAGES: Record<GigStatus, string> = {
  [GigStatus.Pending]: 'No pending gigs.',
  [GigStatus.Approved]: 'No approved gigs.',
  [GigStatus.Rejected]: 'No rejected gigs.',
};

export function isGigStatus(value: string): value is GigStatus {
  return (GIG_FILTER_STATUSES as readonly string[]).includes(value);
}

export function parseGigStatusFromQuery(value: string | null): GigStatus {
  if (value && isGigStatus(value)) {
    return value;
  }
  return GigStatus.Pending;
}

export function getGigStatusFromAdminGigStatusAPI(status: GigStatusAPI): GigStatus {
  switch (status) {
    case GigStatusAPI.Approved:
    case GigStatusAPI.Published: {
      return GigStatus.Approved;
    }
    case GigStatusAPI.Rejected: {
      return GigStatus.Rejected;
    }
    case GigStatusAPI.Pending:
    case GigStatusAPI.New:
    default: {
      return GigStatus.Pending;
    }
  }
}

export function getGigStatusEmptyMessage(status: GigStatus): string {
  return GIG_STATUS_EMPTY_MESSAGES[status];
}

export function getGigStatusLabel(status: GigStatus): string {
  return GIG_STATUS_LABELS[status];
}
