import { z } from 'zod';

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
