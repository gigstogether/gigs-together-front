/** Mirrors API `Status` enum — keep in sync when wiring v1/admin/gigs. */
export type AdminGigStatusAPI = 'Pending' | 'Published' | 'Rejected' | 'Approved' | 'New';

export enum GigStatus {
  Pending = 'pending',
  Published = 'published',
  Rejected = 'rejected',
}

export const GIG_FILTER_STATUSES: readonly GigStatus[] = [
  GigStatus.Pending,
  GigStatus.Published,
  GigStatus.Rejected,
];

export function isGigStatus(value: string): value is GigStatus {
  return (GIG_FILTER_STATUSES as readonly string[]).includes(value);
}

export const GIG_STATUS_LABELS: Record<GigStatus, string> = {
  [GigStatus.Pending]: 'Pending',
  [GigStatus.Published]: 'Published',
  [GigStatus.Rejected]: 'Rejected',
};

export const GIG_STATUS_EMPTY_MESSAGES: Record<GigStatus, string> = {
  [GigStatus.Pending]: 'No pending gigs.',
  [GigStatus.Published]: 'No published gigs.',
  [GigStatus.Rejected]: 'No rejected gigs.',
};

export function getGigStatusEmptyMessage(status: GigStatus): string {
  return GIG_STATUS_EMPTY_MESSAGES[status];
}

export function getGigStatusLabel(status: GigStatus): string {
  return GIG_STATUS_LABELS[status];
}

export interface AdminGigSuggestedBy {
  readonly userId: string;
  readonly name?: string;
  readonly username?: string;
}

/** Compact row for the moderation queue list. */
export interface AdminGigQueueItem {
  readonly publicId: string;
  readonly title: string;
  readonly status: AdminGigStatusAPI;
  readonly date: string;
  readonly endDate?: string;
  readonly city: string;
  readonly countryCode: string;
  readonly venue: string;
  readonly posterUrl?: string;
  readonly suggestedBy: AdminGigSuggestedBy;
}

/** Full card shown in the detail panel (extends queue fields). */
export interface AdminGigDetail extends AdminGigQueueItem {
  readonly ticketsUrl?: string;
  /** Telegram channel post URL when published. */
  readonly postUrl?: string;
  readonly publishPostDate?: number;
  readonly moderationPostDate?: number;
}
