import { z } from 'zod';

import { GigStatusAPI } from '@/app/admin/gigs/_lib/types';
import type {
  AdminGigDetail,
  AdminGigFormData,
  GigStatusFilter,
} from '@/app/admin/gigs/_lib/types';
import type { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/_lib/admin-gigs-sort';
import { apiClientRequest } from '@/lib/api-session-client';
import { isRecord } from '@/lib/is-record';
import { GigCandidateStatusAPI } from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import type {
  AdminGigCandidate,
  AdminGigCandidateDraft,
  AdminGigCandidateLookupResult,
  AdminGigCandidatesSortBy,
  AdminGigCandidatesSortOrder,
  GigCandidateStatusFilter,
} from '@/app/admin/gigs/candidates/_lib/admin-gig-candidate';
import { gigDateToYMD } from '@/lib/feed/feed.mapper';

const V1_ADMIN_API_PREFIX = 'v1/admin/';

const v1AdminDashboardSummarySchema = z
  .object({
    pendingGigsCount: z.number().int().nonnegative(),
    publishedGigsCount: z.number().int().nonnegative(),
  })
  .strict();

const v1AdminDashboardResponseBodySchema = z
  .object({
    summary: v1AdminDashboardSummarySchema,
  })
  .strict();

type AdminDashboard = z.infer<typeof v1AdminDashboardResponseBodySchema>;

const v1AdminLocaleItemSchema = z
  .object({
    iso: z.string(),
    nativeName: z.string(),
    isActive: z.boolean(),
    order: z.number().int().nonnegative(),
  })
  .strict();

const v1AdminLocalesListSchema = z.array(v1AdminLocaleItemSchema);

export type SupportedLocale = z.infer<typeof v1AdminLocaleItemSchema>;

export interface PatchAdminLocaleBody {
  readonly nativeName?: string;
  readonly isActive?: boolean;
  readonly order?: number;
}

export interface LocaleOrderUpdate {
  readonly iso: string;
  readonly order: number;
}

const v1AdminTranslationFormatSchema = z.enum(['plain', 'icu']);
const v1AdminTranslationKindSchema = z.enum(['text', 'template']);

const v1AdminTranslationRecordSchema = z
  .object({
    id: z.string().optional(),
    _id: z.string().optional(),
    key: z.string(),
    value: z.string(),
    namespace: z.string(),
    format: v1AdminTranslationFormatSchema,
    kind: v1AdminTranslationKindSchema,
    locale: z.string(),
    isActive: z.boolean(),
  })
  .strip()
  .superRefine((record, ctx) => {
    const hasId =
      (record.id !== undefined && record.id.length > 0) ||
      (record._id !== undefined && record._id.length > 0);

    if (!hasId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'id is required',
      });
    }
  })
  .transform((record) => ({
    id: record.id ?? record._id ?? '',
    key: record.key,
    value: record.value,
    namespace: record.namespace,
    format: record.format,
    kind: record.kind,
    locale: record.locale,
    isActive: record.isActive,
  }));

const v1AdminTranslationsListResponseSchema = z
  .object({
    records: z.array(v1AdminTranslationRecordSchema),
  })
  .strip();

export type AdminTranslationFormat = z.infer<typeof v1AdminTranslationFormatSchema>;
export type AdminTranslationKind = z.infer<typeof v1AdminTranslationKindSchema>;
export type AdminTranslationRecord = z.infer<typeof v1AdminTranslationRecordSchema>;

export function isAdminTranslationKind(value: string): value is AdminTranslationKind {
  return value === 'text' || value === 'template';
}

const v1AdminTranslationNamespacesListResponseSchema = z
  .object({
    namespaces: z.array(z.string()),
  })
  .strict();

export interface FetchAdminTranslationsParams {
  readonly namespace?: string;
  readonly locale?: string;
}

export interface PutAdminTranslationBody {
  readonly namespace: string;
  readonly locale: string;
  readonly key: string;
  readonly value: string;
  readonly format: 'plain';
  readonly kind: AdminTranslationKind;
  readonly isActive: boolean;
}

export interface PatchAdminTranslationActiveBody {
  readonly isActive: boolean;
}

const v1AdminGigStatusSchema = z.nativeEnum(GigStatusAPI);

const v1AdminGigCandidateUserOriginSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('form') }).strict(),
  z.object({ type: z.literal('admin') }).strict(),
  z
    .object({
      type: z.literal('messenger'),
      messenger: z.literal('Telegram'),
      chatId: z.string(),
      messageId: z.string(),
    })
    .strict(),
]);

const v1AdminGigCandidateSourceSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('user'),
      userId: z.string().min(1),
      origin: v1AdminGigCandidateUserOriginSchema,
      originalText: z.string().optional(),
      attachments: z.array(z.record(z.string(), z.unknown())).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('provider'),
      provider: z
        .object({
          name: z.literal('setlistFm'),
          externalEventId: z.string(),
          externalVersionId: z.string().optional(),
          sourceUrl: z.string(),
          fetchedAt: z.string(),
          providerUpdatedAt: z.string().optional(),
        })
        .strict(),
    })
    .strict(),
]);

const v1AdminGigCandidateDraftSchema = z
  .object({
    title: z.string().optional(),
    date: z.string().optional(),
    endDate: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    venue: z.string().optional(),
    ticketsUrl: z.string().optional(),
    posterUrl: z.string().optional(),
  })
  .strict();

const v1AdminGigCandidateSchema = z
  .object({
    id: z.string().min(1),
    source: v1AdminGigCandidateSourceSchema,
    gigDraft: v1AdminGigCandidateDraftSchema,
    status: z.nativeEnum(GigCandidateStatusAPI),
    version: z.number().int().nonnegative(),
    intakePostUrl: z.string().optional(),
    intakePostDate: z.number().optional(),
    moderationPostUrl: z.string().optional(),
    moderationPostDate: z.number().optional(),
    linkedGigPublicId: z.string().optional(),
    approvedAt: z.string().optional(),
    approvedByUserId: z.string().optional(),
    rejectedAt: z.string().optional(),
    rejectedByUserId: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

const v1AdminGigCandidatesListResponseSchema = z
  .object({
    gigCandidates: z.array(v1AdminGigCandidateSchema),
  })
  .strict();

const v1AdminGigCandidateLookupResponseSchema = z
  .object({
    gigDraft: v1AdminGigCandidateDraftSchema.nullable(),
  })
  .strict();

const v1AdminGigSuggestedBySchema = z
  .object({
    userId: z.string(),
    username: z.string().optional(),
    name: z.string().optional(),
  })
  .strict();

const v1AdminGigListItemSchema = z
  .object({
    publicId: z.string(),
    title: z.string(),
    status: v1AdminGigStatusSchema,
    isVisible: z.boolean(),
    version: z.number().int().nonnegative(),
    date: z.string(),
    endDate: z.string().optional(),
    city: z.string(),
    country: z.string(),
    venue: z.string(),
    posterUrl: z.string().optional(),
    suggestedBy: v1AdminGigSuggestedBySchema,
    ticketsUrl: z.string().optional(),
    publishPostUrl: z.string().optional(),
    publishPostDate: z.number().optional(),
    moderationPostUrl: z.string().optional(),
    moderationPostDate: z.number().optional(),
  })
  .strict();

const v1AdminGigsListResponseSchema = z
  .object({
    gigs: z.array(v1AdminGigListItemSchema),
  })
  .strict();

const v1AdminGigFormDataSchema = z
  .object({
    publicId: z.string(),
    title: z.string(),
    date: z.string(),
    endDate: z.string().optional(),
    city: z.string(),
    country: z.string(),
    venue: z.string(),
    ticketsUrl: z.string(),
    posterUrl: z.string().optional(),
    status: v1AdminGigStatusSchema,
    isVisible: z.boolean(),
    version: z.number().int().nonnegative(),
    suggestedBy: v1AdminGigSuggestedBySchema,
    publishPostUrl: z.string().optional(),
    publishPostDate: z.number().optional(),
    moderationPostUrl: z.string().optional(),
    moderationPostDate: z.number().optional(),
  })
  .strict();

export interface AdminGigsList {
  readonly gigs: readonly AdminGigDetail[];
}

export interface FetchAdminGigsParams {
  readonly status: GigStatusFilter;
  readonly limit?: number;
  readonly sortBy?: AdminGigsSortBy;
  readonly sortOrder?: AdminGigsSortOrder;
}

export interface FetchAdminGigByPublicIdParams {
  readonly publicId: string;
  readonly signal?: AbortSignal;
}

export interface AdminGigCandidatesList {
  gigCandidates: readonly AdminGigCandidate[];
}

export interface FetchAdminGigCandidatesParams {
  status: GigCandidateStatusFilter;
  limit?: number;
  sortBy?: AdminGigCandidatesSortBy;
  sortOrder?: AdminGigCandidatesSortOrder;
}

export interface FetchAdminGigCandidateByIdParams {
  gigCandidateId: string;
  signal?: AbortSignal;
}

export interface AdminGigCandidatePosterInput {
  file: File | null;
  url: string;
}

export interface CreateAdminGigCandidateParams {
  gigDraft: AdminGigCandidateDraft;
  poster: AdminGigCandidatePosterInput;
}

export interface UpdateAdminGigCandidateDraftParams extends CreateAdminGigCandidateParams {
  gigCandidateId: string;
  expectedVersion: number;
}

export interface RejectAdminGigCandidateParams {
  gigCandidateId: string;
  expectedVersion: number;
}

export interface ApproveAdminGigCandidateParams {
  gigCandidateId: string;
  expectedVersion: number;
}

export interface SendAdminGigCandidateToModerationParams {
  gigCandidateId: string;
  expectedVersion: number;
}

export interface LookupAdminGigCandidateDraftParams {
  title: string;
  location: string;
  signal?: AbortSignal;
}

function parseAdminDashboard(payload: unknown): AdminDashboard {
  const parsed = v1AdminDashboardResponseBodySchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Invalid admin dashboard response');
  }
  return parsed.data;
}

function parseAdminLocalesList(payload: unknown): readonly SupportedLocale[] {
  const parsed = v1AdminLocalesListSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid admin locales response: ${JSON.stringify(parsed.error.issues)}`);
  }
  return parsed.data;
}

function buildAdminGigsEndpoint(params: FetchAdminGigsParams): string {
  const qs = new URLSearchParams();
  qs.set('status', params.status);
  if (params.sortBy !== undefined) {
    qs.set('sortBy', params.sortBy);
  }
  if (params.sortOrder !== undefined) {
    qs.set('sortOrder', params.sortOrder);
  }
  if (params.limit !== undefined) {
    qs.set('limit', String(params.limit));
  }
  return `${V1_ADMIN_API_PREFIX}gigs?${qs.toString()}`;
}

function parseAdminGigsList(payload: unknown): AdminGigsList {
  const parsed = v1AdminGigsListResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid admin gigs response: ${JSON.stringify(parsed.error.issues)}`);
  }
  return parsed.data;
}

function parseAdminGigFormData(payload: unknown): AdminGigFormData {
  const parsed = v1AdminGigFormDataSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid admin gig response: ${JSON.stringify(parsed.error.issues)}`);
  }
  return parsed.data;
}

function parseAdminGigCandidatesList(payload: unknown): AdminGigCandidatesList {
  const parsed = v1AdminGigCandidatesListResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(
      `Invalid admin Gig Candidates response: ${JSON.stringify(parsed.error.issues)}`,
    );
  }
  return parsed.data;
}

function parseAdminGigCandidate(payload: unknown): AdminGigCandidate {
  const parsed = v1AdminGigCandidateSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid admin Gig Candidate response: ${JSON.stringify(parsed.error.issues)}`);
  }
  return parsed.data;
}

function parseAdminGigCandidateLookup(payload: unknown): AdminGigCandidateLookupResult | null {
  const parsed = v1AdminGigCandidateLookupResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(
      `Invalid admin Gig Candidate lookup response: ${JSON.stringify(parsed.error.issues)}`,
    );
  }
  if (parsed.data.gigDraft === null) {
    return null;
  }
  if (!parsed.data.gigDraft.date) {
    throw new Error('Gig Candidate lookup did not return a date');
  }
  return {
    ...parsed.data.gigDraft,
    date: normalizeGigCandidateLookupDate(parsed.data.gigDraft.date, 'gigDraft.date'),
    ...(parsed.data.gigDraft.endDate !== undefined
      ? {
          endDate: normalizeGigCandidateLookupDate(
            parsed.data.gigDraft.endDate,
            'gigDraft.endDate',
          ),
        }
      : {}),
  };
}

function normalizeGigCandidateLookupDate(date: string, field: string): string {
  try {
    return gigDateToYMD(date);
  } catch {
    throw new Error(
      `Invalid admin Gig Candidate lookup response: "${field}" must be YYYY-MM-DD or ISO`,
    );
  }
}

function parseAdminLocaleResponse(payload: unknown): SupportedLocale {
  const parsed = v1AdminLocaleItemSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid admin locale response: ${JSON.stringify(parsed.error.issues)}`);
  }
  return parsed.data;
}

function parseAdminTranslationNamespacesList(payload: unknown): readonly string[] {
  const parsed = v1AdminTranslationNamespacesListResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(
      `Invalid admin translation namespaces response: ${JSON.stringify(parsed.error.issues)}`,
    );
  }
  return parsed.data.namespaces;
}

function parseAdminTranslationsList(payload: unknown): readonly AdminTranslationRecord[] {
  if (isRecord(payload) && 'translations' in payload && !('records' in payload)) {
    throw new Error(
      'Invalid admin translations response: received locale translations payload ({ locale, translations }). Expected { records } from GET /v1/admin/translations.',
    );
  }

  const parsed = v1AdminTranslationsListResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid admin translations response: ${JSON.stringify(parsed.error.issues)}`);
  }
  return parsed.data.records;
}

function parseAdminTranslationRecord(payload: unknown): AdminTranslationRecord {
  const parsed = v1AdminTranslationRecordSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid admin translation response: ${JSON.stringify(parsed.error.issues)}`);
  }
  return parsed.data;
}

function buildAdminTranslationsEndpoint(params: FetchAdminTranslationsParams): string {
  const qs = new URLSearchParams();
  const namespace = params.namespace?.trim();
  if (namespace !== undefined && namespace.length > 0) {
    qs.set('namespace', namespace);
  }
  if (params.locale !== undefined && params.locale.trim().length > 0) {
    qs.set('locale', params.locale.trim().toLowerCase());
  }

  const query = qs.toString();
  return query.length > 0
    ? `${V1_ADMIN_API_PREFIX}translations?${query}`
    : `${V1_ADMIN_API_PREFIX}translations`;
}

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const raw = await apiClientRequest<unknown>(`${V1_ADMIN_API_PREFIX}dashboard`, 'GET');
  return parseAdminDashboard(raw);
}

export async function fetchAdminLocales(): Promise<readonly SupportedLocale[]> {
  const raw = await apiClientRequest<unknown>(`${V1_ADMIN_API_PREFIX}locales`, 'GET');
  return parseAdminLocalesList(raw);
}

export async function fetchAdminGigs(params: FetchAdminGigsParams): Promise<AdminGigsList> {
  const raw = await apiClientRequest<unknown>(buildAdminGigsEndpoint(params), 'GET');
  return parseAdminGigsList(raw);
}

export async function fetchAdminGigByPublicId(
  params: FetchAdminGigByPublicIdParams,
): Promise<AdminGigFormData> {
  const publicId = encodeURIComponent(params.publicId.trim());
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}gig/${publicId}`,
    'GET',
    undefined,
    {
      signal: params.signal,
    },
  );
  return parseAdminGigFormData(raw);
}

export async function fetchAdminGigCandidates(
  params: FetchAdminGigCandidatesParams,
): Promise<AdminGigCandidatesList> {
  const search = new URLSearchParams({ status: params.status });
  if (params.sortBy !== undefined) {
    search.set('sortBy', params.sortBy);
  }
  if (params.sortOrder !== undefined) {
    search.set('sortOrder', params.sortOrder);
  }
  if (params.limit !== undefined) {
    search.set('limit', String(params.limit));
  }
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}gig-candidates?${search.toString()}`,
    'GET',
  );
  return parseAdminGigCandidatesList(raw);
}

export async function fetchAdminGigCandidateById(
  params: FetchAdminGigCandidateByIdParams,
): Promise<AdminGigCandidate> {
  const gigCandidateId = encodeURIComponent(params.gigCandidateId.trim());
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}gig-candidates/${gigCandidateId}`,
    'GET',
    undefined,
    { signal: params.signal },
  );
  return parseAdminGigCandidate(raw);
}

export async function createAdminGigCandidate(
  params: CreateAdminGigCandidateParams,
): Promise<AdminGigCandidate> {
  const body = buildAdminGigCandidateMutationBody(params);
  const raw = await apiClientRequest<unknown, FormData | typeof body>(
    `${V1_ADMIN_API_PREFIX}gig-candidates`,
    'POST',
    body,
  );
  return parseAdminGigCandidate(raw);
}

export async function updateAdminGigCandidateDraft(
  params: UpdateAdminGigCandidateDraftParams,
): Promise<AdminGigCandidate> {
  const gigCandidateId = encodeURIComponent(params.gigCandidateId.trim());
  const body = buildAdminGigCandidateMutationBody(params);
  if (body instanceof FormData) {
    body.append('expectedVersion', String(params.expectedVersion));
  }
  const requestBody =
    body instanceof FormData ? body : { ...body, expectedVersion: params.expectedVersion };
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}gig-candidates/${gigCandidateId}/gig-draft`,
    'PATCH',
    requestBody,
  );
  return parseAdminGigCandidate(raw);
}

export async function rejectAdminGigCandidate(
  params: RejectAdminGigCandidateParams,
): Promise<AdminGigCandidate> {
  const gigCandidateId = encodeURIComponent(params.gigCandidateId.trim());
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}gig-candidates/${gigCandidateId}/reject`,
    'POST',
    { expectedVersion: params.expectedVersion },
  );
  return parseAdminGigCandidate(raw);
}

export async function approveAdminGigCandidate(
  params: ApproveAdminGigCandidateParams,
): Promise<AdminGigCandidate> {
  const gigCandidateId = encodeURIComponent(params.gigCandidateId.trim());
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}gig-candidates/${gigCandidateId}/approve`,
    'POST',
    { expectedVersion: params.expectedVersion },
  );
  return parseAdminGigCandidate(raw);
}

export async function sendAdminGigCandidateToModeration(
  params: SendAdminGigCandidateToModerationParams,
): Promise<AdminGigCandidate> {
  const gigCandidateId = encodeURIComponent(params.gigCandidateId.trim());
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}gig-candidates/${gigCandidateId}/send-to-moderation`,
    'POST',
    { expectedVersion: params.expectedVersion },
  );
  return parseAdminGigCandidate(raw);
}

export async function lookupAdminGigCandidateDraft(
  params: LookupAdminGigCandidateDraftParams,
): Promise<AdminGigCandidateLookupResult | null> {
  const title = params.title.trim();
  const location = params.location.trim();
  if (!title) {
    throw new Error('Gig Candidate lookup requires title');
  }
  if (!location) {
    throw new Error('Gig Candidate lookup requires location');
  }
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}gig-candidates/lookup`,
    'POST',
    { title, location },
    { signal: params.signal },
  );
  return parseAdminGigCandidateLookup(raw);
}

function buildAdminGigCandidateMutationBody(
  params: CreateAdminGigCandidateParams,
): FormData | { gigDraft: AdminGigCandidateDraft } {
  const posterUrl = params.poster.url.trim();
  if (posterUrl) {
    new URL(posterUrl);
  }
  const gigDraft = {
    ...params.gigDraft,
    ...(posterUrl ? { posterUrl } : {}),
  };

  if (params.poster.file) {
    const body = new FormData();
    body.append('posterFile', params.poster.file);
    body.append('gigDraft', JSON.stringify(gigDraft));
    return body;
  }
  return { gigDraft };
}

export async function patchAdminLocale(
  iso: string,
  body: PatchAdminLocaleBody,
): Promise<SupportedLocale> {
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}locales/${encodeURIComponent(iso)}`,
    'PATCH',
    body,
  );
  return parseAdminLocaleResponse(raw);
}

export async function patchAdminLocalesOrder(
  locales: readonly LocaleOrderUpdate[],
): Promise<readonly SupportedLocale[]> {
  const raw = await apiClientRequest<unknown>(`${V1_ADMIN_API_PREFIX}locales/order`, 'PATCH', {
    locales,
  });
  return parseAdminLocalesList(raw);
}

export async function fetchAdminTranslationNamespaces(): Promise<readonly string[]> {
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}translations/namespaces`,
    'GET',
  );
  return parseAdminTranslationNamespacesList(raw);
}

export async function fetchAdminTranslations(
  params: FetchAdminTranslationsParams,
): Promise<readonly AdminTranslationRecord[]> {
  const raw = await apiClientRequest<unknown>(buildAdminTranslationsEndpoint(params), 'GET');
  return parseAdminTranslationsList(raw);
}

export async function putAdminTranslation(
  body: PutAdminTranslationBody,
): Promise<AdminTranslationRecord> {
  const raw = await apiClientRequest<unknown>(`${V1_ADMIN_API_PREFIX}translations`, 'PUT', body);
  return parseAdminTranslationRecord(raw);
}

export async function patchAdminTranslationActive(
  id: string,
  body: PatchAdminTranslationActiveBody,
): Promise<AdminTranslationRecord> {
  const raw = await apiClientRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}translations/${encodeURIComponent(id.trim())}/active`,
    'PATCH',
    body,
  );
  return parseAdminTranslationRecord(raw);
}

export function postAdminGigApprove(publicId: string): Promise<void> {
  const encodedPublicId = encodeURIComponent(publicId.trim());
  return apiClientRequest<void>(`${V1_ADMIN_API_PREFIX}gig/${encodedPublicId}/approve`, 'POST');
}

export function postAdminGigReject(publicId: string): Promise<void> {
  const encodedPublicId = encodeURIComponent(publicId.trim());
  return apiClientRequest<void>(`${V1_ADMIN_API_PREFIX}gig/${encodedPublicId}/reject`, 'POST');
}

export function postAdminGigPost(publicId: string): Promise<void> {
  const encodedPublicId = encodeURIComponent(publicId.trim());
  return apiClientRequest<void>(`${V1_ADMIN_API_PREFIX}gig/${encodedPublicId}/post`, 'POST');
}

export function postAdminDigestPublish(): Promise<void> {
  return apiClientRequest<void>(`${V1_ADMIN_API_PREFIX}digest/publish`, 'POST');
}

export function postAdminFeedRevalidate(): Promise<void> {
  return apiClientRequest<void>(`${V1_ADMIN_API_PREFIX}feed/revalidate`, 'POST');
}

export function postAdminTranslationsRevalidate(): Promise<void> {
  return apiClientRequest<void>(`${V1_ADMIN_API_PREFIX}translations/revalidate`, 'POST');
}
