import { z } from 'zod';

import { GigStatusAPI } from '@/app/admin/gigs/types';
import type { AdminGigDetail, AdminGigFormData, GigStatusFilter } from '@/app/admin/gigs/types';
import type { AdminGigsSortBy, AdminGigsSortOrder } from '@/app/admin/gigs/admin-gigs-sort';
import { apiRequest } from '@/lib/api';

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

const v1AdminLanguageItemSchema = z
  .object({
    iso: z.string(),
    name: z.string(),
    isActive: z.boolean(),
    order: z.number().int().nonnegative(),
  })
  .strict();

const v1AdminLanguagesListSchema = z.array(v1AdminLanguageItemSchema);

export type AdminLanguage = z.infer<typeof v1AdminLanguageItemSchema>;

export interface PatchAdminLanguageBody {
  readonly name?: string;
  readonly isActive?: boolean;
  readonly order?: number;
}

export interface AdminLanguageOrderUpdate {
  readonly iso: string;
  readonly order: number;
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

function parseAdminLanguagesList(payload: unknown): readonly AdminLanguage[] {
  const parsed = v1AdminLanguagesListSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid admin languages response: ${JSON.stringify(parsed.error.issues)}`);
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

function parseAdminLanguageResponse(payload: unknown): AdminLanguage {
  const parsed = v1AdminLanguageItemSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Invalid admin language response: ${JSON.stringify(parsed.error.issues)}`);
  }
  return parsed.data;
}

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const raw = await apiRequest<unknown>(`${V1_ADMIN_API_PREFIX}dashboard`, 'GET');
  return parseAdminDashboard(raw);
}

export async function fetchAdminLanguages(): Promise<readonly AdminLanguage[]> {
  const raw = await apiRequest<unknown>(`${V1_ADMIN_API_PREFIX}languages`, 'GET');
  return parseAdminLanguagesList(raw);
}

export async function fetchAdminGigs(params: FetchAdminGigsParams): Promise<AdminGigsList> {
  const raw = await apiRequest<unknown>(buildAdminGigsEndpoint(params), 'GET');
  return parseAdminGigsList(raw);
}

export async function fetchAdminGigByPublicId(
  params: FetchAdminGigByPublicIdParams,
): Promise<AdminGigFormData> {
  const publicId = encodeURIComponent(params.publicId.trim());
  const raw = await apiRequest<unknown>(`${V1_ADMIN_API_PREFIX}gig/${publicId}`, 'GET', undefined, {
    signal: params.signal,
  });
  return parseAdminGigFormData(raw);
}

export async function patchAdminLanguage(
  iso: string,
  body: PatchAdminLanguageBody,
): Promise<AdminLanguage> {
  const raw = await apiRequest<unknown>(
    `${V1_ADMIN_API_PREFIX}languages/${encodeURIComponent(iso)}`,
    'PATCH',
    body,
  );
  return parseAdminLanguageResponse(raw);
}

export async function patchAdminLanguagesOrder(
  languages: readonly AdminLanguageOrderUpdate[],
): Promise<readonly AdminLanguage[]> {
  const raw = await apiRequest<unknown>(`${V1_ADMIN_API_PREFIX}languages/order`, 'PATCH', {
    languages,
  });
  return parseAdminLanguagesList(raw);
}

export function postAdminGigApprove(publicId: string): Promise<void> {
  const encodedPublicId = encodeURIComponent(publicId.trim());
  return apiRequest<void>(`${V1_ADMIN_API_PREFIX}gig/${encodedPublicId}/approve`, 'POST');
}

export function postAdminGigReject(publicId: string): Promise<void> {
  const encodedPublicId = encodeURIComponent(publicId.trim());
  return apiRequest<void>(`${V1_ADMIN_API_PREFIX}gig/${encodedPublicId}/reject`, 'POST');
}

export function postAdminGigPost(publicId: string): Promise<void> {
  const encodedPublicId = encodeURIComponent(publicId.trim());
  return apiRequest<void>(`${V1_ADMIN_API_PREFIX}gig/${encodedPublicId}/post`, 'POST');
}
