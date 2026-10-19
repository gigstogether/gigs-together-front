interface GigUserSourceForAdminViewBase {
  type: 'user';
  displayName?: string;
  isCurrentlyAdmin: boolean;
  telegramUsername?: string;
}

interface GigIdentifiedUserSourceForAdminView extends GigUserSourceForAdminViewBase {
  userId: string;
  origin: { type: 'form' | 'admin' };
}

interface GigMessengerUserSourceForAdminView extends GigUserSourceForAdminViewBase {
  userId?: string;
  origin: { type: 'messenger'; messenger: 'Telegram' };
}

interface GigProviderSourceForAdminView {
  type: 'provider';
  provider: {
    name: string;
    externalEventId: string;
    externalVersionId?: string;
    sourceUrl: string;
    fetchedAt: string;
    providerUpdatedAt?: string;
  };
}

export type GigSourceForAdminView =
  | GigIdentifiedUserSourceForAdminView
  | GigMessengerUserSourceForAdminView
  | GigProviderSourceForAdminView;

/** Compact row for the admin Gig list. */
export interface AdminGigQueueItem {
  readonly publicId: string;
  readonly title: string;
  readonly isVisible: boolean;
  readonly version: number;
  readonly source: GigSourceForAdminView;
  readonly date: string;
  readonly endDate?: string;
  readonly city: string;
  readonly country: string;
  readonly venue: string;
  readonly posterUrl?: string;
}

/** Full card shown in the detail panel. */
export interface AdminGigDetail extends AdminGigQueueItem {
  readonly ticketsUrl?: string;
  readonly mainPostUrl?: string;
  readonly mainPostDate?: number;
  readonly moderationPostDate?: number;
  readonly moderationPostUrl?: string;
}

/** Mirrors the response from GET v1/admin/gigs/:publicId. */
export interface AdminGigFormData extends AdminGigQueueItem {
  readonly ticketsUrl: string;
  readonly mainPostUrl?: string;
  readonly mainPostDate?: number;
  readonly moderationPostDate?: number;
  readonly moderationPostUrl?: string;
}
