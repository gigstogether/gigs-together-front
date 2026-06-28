/** Mirrors API `Status` enum — keep in sync when wiring v1/admin/gigs. */
export enum GigStatusAPI {
  New = 'New',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Published = 'Published',
}

export enum GigStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
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
  readonly status: GigStatusAPI;
  readonly date: string;
  readonly endDate?: string;
  readonly city: string;
  readonly country: string;
  readonly venue: string;
  readonly posterUrl?: string;
  readonly suggestedBy: AdminGigSuggestedBy;
}

/** Full card shown in the detail panel (extends queue fields). */
export interface AdminGigDetail extends AdminGigQueueItem {
  readonly ticketsUrl?: string;
  readonly publishPostUrl?: string;
  readonly publishPostDate?: number;
  readonly moderationPostDate?: number;
  readonly moderationPostUrl?: string;
}

/** Mirrors API `GigFormDataByPublicId` — GET v1/admin/gig/:publicId. */
export interface AdminGigFormData {
  readonly publicId: string;
  readonly title: string;
  readonly date: string;
  readonly endDate?: string;
  readonly city: string;
  readonly country: string;
  readonly venue: string;
  readonly ticketsUrl: string;
  readonly posterUrl?: string;
  readonly status: GigStatusAPI;
  readonly suggestedBy: AdminGigSuggestedBy;
  readonly publishPostUrl?: string;
  readonly publishPostDate?: number;
  readonly moderationPostDate?: number;
  readonly moderationPostUrl?: string;
}
