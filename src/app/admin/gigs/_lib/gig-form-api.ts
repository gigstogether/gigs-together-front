import { apiClientRequest } from '@/lib/api-session-client';
import { gigDateToYMD } from '@/lib/feed/feed.mapper';

export type PosterMode = 'upload' | 'url';

export interface PosterSelection {
  mode: PosterMode;
  file: File | null;
  url: string;
}

export interface GigUpsertPayload {
  title: string;
  date: string;
  endDate?: string;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
}

export interface GigUpsertResponse {
  publicId: string;
}

export interface GigUpsertApiParams {
  gig: GigUpsertPayload;
  poster: PosterSelection;
}

export interface UpdateGigParams extends GigUpsertApiParams {
  publicId: string;
  expectedVersion: number;
}

export type GigApiDateFieldPath = 'gig.date' | 'gig.endDate';

export function normalizeGigApiDate(date: string, fieldPath: GigApiDateFieldPath): string {
  try {
    return gigDateToYMD(date);
  } catch {
    throw new Error(`Invalid API response: "${fieldPath}" must be YYYY-MM-DD (or ISO)`);
  }
}

function getPosterUrlOrUndefined(poster: PosterSelection): string | undefined {
  if (poster.mode !== 'url') return undefined;
  const trimmed = (poster.url ?? '').trim();
  if (!trimmed) return undefined;
  new URL(trimmed);
  return trimmed;
}

interface SubmitGigParams extends GigUpsertApiParams {
  endpoint: string;
  expectedVersion: number;
}

async function submitGig<TResponse = void>(params: SubmitGigParams): Promise<TResponse> {
  const gig: GigUpsertPayload = {
    title: params.gig.title,
    date: params.gig.date,
    endDate: params.gig.endDate || undefined,
    city: params.gig.city,
    country: params.gig.country,
    venue: params.gig.venue,
    ticketsUrl: params.gig.ticketsUrl,
  };

  const posterUrl = getPosterUrlOrUndefined(params.poster);

  if (params.poster.mode === 'upload' && params.poster.file) {
    const posterFile = params.poster.file;
    const fd = new FormData();
    fd.append('posterFile', posterFile);
    fd.append('gig', JSON.stringify(gig));
    fd.append('expectedVersion', String(params.expectedVersion));
    return apiClientRequest<TResponse, FormData>(params.endpoint, 'PATCH', fd);
  }

  if (posterUrl) {
    return apiClientRequest<TResponse>(params.endpoint, 'PATCH', {
      gig: { ...gig, posterUrl },
      expectedVersion: params.expectedVersion,
    });
  }

  return apiClientRequest<TResponse>(params.endpoint, 'PATCH', {
    gig,
    expectedVersion: params.expectedVersion,
  });
}

export function updateGig(params: UpdateGigParams): Promise<GigUpsertResponse> {
  return submitGig<GigUpsertResponse>({
    endpoint: `v1/admin/gigs/${encodeURIComponent(params.publicId)}`,
    expectedVersion: params.expectedVersion,
    gig: params.gig,
    poster: params.poster,
  });
}
