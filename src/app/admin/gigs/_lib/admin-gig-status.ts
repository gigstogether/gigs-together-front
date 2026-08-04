import { GigStatus, GigStatusAPI, GigStatusFilter } from '@/app/admin/gigs/_lib/types';

export const GIG_FILTER_STATUSES: readonly GigStatusFilter[] = [
  GigStatusFilter.Pending,
  GigStatusFilter.Approved,
  GigStatusFilter.Rejected,
];

export const GIG_STATUS_FILTER_LABELS: Record<GigStatusFilter, string> = {
  [GigStatusFilter.Pending]: 'Pending',
  [GigStatusFilter.Approved]: 'Approved',
  [GigStatusFilter.Rejected]: 'Rejected',
};

export const GIG_STATUS_FILTER_EMPTY_MESSAGES: Record<GigStatusFilter, string> = {
  [GigStatusFilter.Pending]: 'No pending and new gigs.',
  [GigStatusFilter.Approved]: 'No approved and published gigs.',
  [GigStatusFilter.Rejected]: 'No rejected gigs.',
};

export function isGigStatusFilter(value: string): value is GigStatusFilter {
  return (GIG_FILTER_STATUSES as readonly string[]).includes(value);
}

export function parseGigStatusFilterFromQuery(value: string | null): GigStatusFilter {
  if (value && isGigStatusFilter(value)) {
    return value;
  }
  return GigStatusFilter.Pending;
}

export function mapGigStatusFromAPI(status: GigStatusAPI): GigStatus {
  switch (status) {
    case GigStatusAPI.Published: {
      return GigStatus.Published;
    }
    case GigStatusAPI.Approved: {
      return GigStatus.Approved;
    }
    case GigStatusAPI.Rejected: {
      return GigStatus.Rejected;
    }
    case GigStatusAPI.New: {
      return GigStatus.New;
    }
    case GigStatusAPI.Pending:
    default: {
      return GigStatus.Pending;
    }
  }
}

export function getGigStatusEmptyMessage(status: GigStatusFilter): string {
  return GIG_STATUS_FILTER_EMPTY_MESSAGES[status];
}

export function getGigStatusLabel(status: GigStatusFilter): string {
  return GIG_STATUS_FILTER_LABELS[status];
}

export const GIG_STATUS_DOT_CLASS_NAMES: Record<GigStatus, string> = {
  [GigStatus.New]: 'bg-slate-500',
  [GigStatus.Pending]: 'bg-yellow-500',
  [GigStatus.Approved]: 'bg-emerald-500',
  [GigStatus.Published]: 'bg-emerald-500',
  [GigStatus.Rejected]: 'bg-rose-500',
};
