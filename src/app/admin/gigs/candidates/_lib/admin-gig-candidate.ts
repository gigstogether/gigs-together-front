export enum GigCandidateStatusAPI {
  New = 'New',
  Reviewing = 'Reviewing',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum GigCandidateStatusFilter {
  New = 'new',
  Reviewing = 'reviewing',
  Approved = 'approved',
  Rejected = 'rejected',
}

export interface AdminGigCandidateUserFormOrigin {
  type: 'form';
}

export interface AdminGigCandidateUserAdminOrigin {
  type: 'admin';
}

export interface AdminGigCandidateUserMessengerOrigin {
  type: 'messenger';
  messenger: 'Telegram';
  conversationId: string;
  messageId: string;
}

export type AdminGigCandidateUserOrigin =
  | AdminGigCandidateUserFormOrigin
  | AdminGigCandidateUserAdminOrigin
  | AdminGigCandidateUserMessengerOrigin;

export interface AdminGigCandidateUserSource {
  type: 'user';
  userId: string;
  origin: AdminGigCandidateUserOrigin;
  originalText?: string;
  attachments?: Record<string, unknown>[];
}

export interface AdminGigCandidateProviderReference {
  name: 'setlistFm';
  externalEventId: string;
  externalVersionId?: string;
  sourceUrl: string;
  fetchedAt: string;
  providerUpdatedAt?: string;
}

export interface AdminGigCandidateProviderSource {
  type: 'provider';
  provider: AdminGigCandidateProviderReference;
}

export type AdminGigCandidateSource = AdminGigCandidateUserSource | AdminGigCandidateProviderSource;

export interface AdminGigCandidateDraft {
  title?: string;
  date?: string;
  endDate?: string;
  city?: string;
  country?: string;
  venue?: string;
  ticketsUrl?: string;
  posterUrl?: string;
}

export interface AdminGigCandidate {
  id: string;
  source: AdminGigCandidateSource;
  gigDraft: AdminGigCandidateDraft;
  status: GigCandidateStatusAPI;
  version: number;
  postUrl?: string;
  postDate?: number;
  linkedGigPublicId?: string;
  approvedAt?: string;
  approvedByUserId?: string;
  rejectedAt?: string;
  rejectedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGigCandidateLookupResult extends AdminGigCandidateDraft {
  date: string;
}

export enum AdminGigCandidatesSortBy {
  CreatedAt = 'createdAt',
  EventDate = 'eventDate',
}

export enum AdminGigCandidatesSortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export const ADMIN_GIG_CANDIDATES_SORT_BY_VALUES = [
  AdminGigCandidatesSortBy.CreatedAt,
  AdminGigCandidatesSortBy.EventDate,
] as const;

export const ADMIN_GIG_CANDIDATES_SORT_ORDER_VALUES = [
  AdminGigCandidatesSortOrder.Asc,
  AdminGigCandidatesSortOrder.Desc,
] as const;

export const ADMIN_GIG_CANDIDATES_DEFAULT_SORT_BY = AdminGigCandidatesSortBy.CreatedAt;
export const ADMIN_GIG_CANDIDATES_DEFAULT_SORT_ORDER = AdminGigCandidatesSortOrder.Desc;

export const ADMIN_GIG_CANDIDATES_SORT_BY_LABELS: Record<AdminGigCandidatesSortBy, string> = {
  [AdminGigCandidatesSortBy.CreatedAt]: 'Created',
  [AdminGigCandidatesSortBy.EventDate]: 'Event date',
};

function isAdminGigCandidatesSortBy(value: string): value is AdminGigCandidatesSortBy {
  return ADMIN_GIG_CANDIDATES_SORT_BY_VALUES.some((sortBy) => sortBy === value);
}

function isAdminGigCandidatesSortOrder(value: string): value is AdminGigCandidatesSortOrder {
  return ADMIN_GIG_CANDIDATES_SORT_ORDER_VALUES.some((sortOrder) => sortOrder === value);
}

export function parseAdminGigCandidatesSortBy(value: string | null): AdminGigCandidatesSortBy {
  if (value && isAdminGigCandidatesSortBy(value)) {
    return value;
  }
  return ADMIN_GIG_CANDIDATES_DEFAULT_SORT_BY;
}

export function parseAdminGigCandidatesSortOrder(
  value: string | null,
): AdminGigCandidatesSortOrder {
  if (value && isAdminGigCandidatesSortOrder(value)) {
    return value;
  }
  return ADMIN_GIG_CANDIDATES_DEFAULT_SORT_ORDER;
}
