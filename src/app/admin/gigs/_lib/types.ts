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

export interface AdminGigLocality {
  id: string;
  countryIso: string;
  name: string;
  qualifier?: string;
}

export interface AdminGigVenue {
  id: string;
  name: string;
}

/** Compact row for the admin Gig list. */
export interface AdminGigListItem {
  publicId: string;
  communityIds: string[];
  venueIds: string[];
  locality: AdminGigLocality;
  venues: AdminGigVenue[];
  title: string;
  isVisible: boolean;
  version: number;
  source: GigSourceForAdminView;
  date: string;
  endDate?: string;
  posterUrl?: string;
}

/** Full card shown in the detail panel. */
export interface AdminGigDetail extends AdminGigListItem {
  ticketsUrl?: string;
  mainPostUrl?: string;
  mainPostDate?: number;
  moderationPostDate?: number;
  moderationPostUrl?: string;
}

/** Mirrors the response from GET v1/admin/gigs/:publicId. */
export interface AdminGigFormData extends AdminGigListItem {
  ticketsUrl: string;
  mainPostUrl?: string;
  mainPostDate?: number;
  moderationPostDate?: number;
  moderationPostUrl?: string;
}
