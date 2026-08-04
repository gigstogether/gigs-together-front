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
