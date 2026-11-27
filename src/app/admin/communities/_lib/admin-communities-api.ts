import { z } from 'zod';

import { apiClientRequest } from '@/lib/api-session-client';

const COMMUNITIES_ENDPOINT = 'v1/admin/communities';

const adminCommunitySchema = z
  .object({
    id: z.string().min(1),
    countryIso: z.string().regex(/^[A-Z]{2}$/),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    nameTranslationKey: z.string().min(1),
    timeZone: z.string().min(1),
    isActive: z.boolean(),
  })
  .strict();

const communitiesResponseSchema = z.object({ communities: z.array(adminCommunitySchema) }).strict();

export type AdminCommunity = z.infer<typeof adminCommunitySchema>;

export interface AdminCommunityBody {
  countryIso: string;
  slug: string;
  nameTranslationKey: string;
  timeZone: string;
  isActive: boolean;
}

export async function fetchAdminCommunities(): Promise<AdminCommunity[]> {
  const raw = await apiClientRequest<unknown>(COMMUNITIES_ENDPOINT, 'GET');
  return communitiesResponseSchema.parse(raw).communities;
}

export async function createAdminCommunity(body: AdminCommunityBody): Promise<AdminCommunity> {
  const raw = await apiClientRequest<unknown, AdminCommunityBody>(
    COMMUNITIES_ENDPOINT,
    'POST',
    body,
  );
  return adminCommunitySchema.parse(raw);
}

export async function updateAdminCommunity(
  id: string,
  body: AdminCommunityBody,
): Promise<AdminCommunity> {
  const raw = await apiClientRequest<unknown, AdminCommunityBody>(
    `${COMMUNITIES_ENDPOINT}/${encodeURIComponent(id)}`,
    'PATCH',
    body,
  );
  return adminCommunitySchema.parse(raw);
}
