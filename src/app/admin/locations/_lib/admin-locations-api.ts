import { z } from 'zod';

import { apiClientRequest } from '@/lib/api-session-client';

const V1_ADMIN_LOCALITIES_ENDPOINT = 'v1/admin/localities';
const V1_ADMIN_VENUES_ENDPOINT = 'v1/admin/venues';

const adminLocalitySchema = z
  .object({
    id: z.string().min(1),
    countryIso: z.string().length(2),
    name: z.string().min(1),
    qualifier: z.string().min(1).optional(),
    aliases: z.array(z.string().min(1)),
    timeZone: z.string().min(1),
  })
  .strict();

const adminLocalitiesResponseSchema = z
  .object({
    localities: z.array(adminLocalitySchema),
  })
  .strict();

const adminVenueSchema = z
  .object({
    id: z.string().min(1),
    localityId: z.string().min(1),
    name: z.string().min(1),
    aliases: z.array(z.string().min(1)),
    isActive: z.boolean(),
  })
  .strict();

const adminVenuesResponseSchema = z
  .object({
    venues: z.array(adminVenueSchema),
  })
  .strict();

export type AdminLocality = z.infer<typeof adminLocalitySchema>;
export type AdminVenue = z.infer<typeof adminVenueSchema>;

export interface CreateAdminLocalityBody {
  countryIso: string;
  name: string;
  qualifier?: string;
  aliases: string[];
  timeZone: string;
}

export interface UpdateAdminLocalityBody {
  name: string;
  qualifier: string | null;
  aliases: string[];
  timeZone: string;
}

export interface CreateAdminVenueBody {
  localityId: string;
  name: string;
  aliases: string[];
  isActive: boolean;
}

export interface UpdateAdminVenueBody {
  name: string;
  aliases: string[];
  isActive: boolean;
}

export async function fetchAdminLocalities(): Promise<AdminLocality[]> {
  const raw = await apiClientRequest<unknown>(V1_ADMIN_LOCALITIES_ENDPOINT, 'GET');
  return adminLocalitiesResponseSchema.parse(raw).localities;
}

export async function createAdminLocality(body: CreateAdminLocalityBody): Promise<AdminLocality> {
  const raw = await apiClientRequest<unknown, CreateAdminLocalityBody>(
    V1_ADMIN_LOCALITIES_ENDPOINT,
    'POST',
    body,
  );
  return adminLocalitySchema.parse(raw);
}

export async function updateAdminLocality(
  id: string,
  body: UpdateAdminLocalityBody,
): Promise<AdminLocality> {
  const raw = await apiClientRequest<unknown, UpdateAdminLocalityBody>(
    `${V1_ADMIN_LOCALITIES_ENDPOINT}/${encodeURIComponent(id)}`,
    'PATCH',
    body,
  );
  return adminLocalitySchema.parse(raw);
}

export function deleteAdminLocality(id: string): Promise<void> {
  return apiClientRequest<void>(
    `${V1_ADMIN_LOCALITIES_ENDPOINT}/${encodeURIComponent(id)}`,
    'DELETE',
  );
}

export async function fetchAdminVenues(): Promise<AdminVenue[]> {
  const raw = await apiClientRequest<unknown>(V1_ADMIN_VENUES_ENDPOINT, 'GET');
  return adminVenuesResponseSchema.parse(raw).venues;
}

export async function createAdminVenue(body: CreateAdminVenueBody): Promise<AdminVenue> {
  const raw = await apiClientRequest<unknown, CreateAdminVenueBody>(
    V1_ADMIN_VENUES_ENDPOINT,
    'POST',
    body,
  );
  return adminVenueSchema.parse(raw);
}

export async function updateAdminVenue(
  id: string,
  body: UpdateAdminVenueBody,
): Promise<AdminVenue> {
  const raw = await apiClientRequest<unknown, UpdateAdminVenueBody>(
    `${V1_ADMIN_VENUES_ENDPOINT}/${encodeURIComponent(id)}`,
    'PATCH',
    body,
  );
  return adminVenueSchema.parse(raw);
}

export function deleteAdminVenue(id: string): Promise<void> {
  return apiClientRequest<void>(`${V1_ADMIN_VENUES_ENDPOINT}/${encodeURIComponent(id)}`, 'DELETE');
}
