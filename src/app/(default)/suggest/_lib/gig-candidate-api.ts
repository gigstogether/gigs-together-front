import { apiClientRequest } from '@/lib/api-session-client';

const GIG_CANDIDATES_ENDPOINT = 'v1/gig-candidates';
import { isRecord } from '@/lib/is-record';

export type GigCandidatePosterMode = 'upload' | 'url';

export interface GigCandidatePosterSelection {
  mode: GigCandidatePosterMode;
  file: File | null;
  url: string;
}

export interface GigCandidateUpsertPayload {
  title: string;
  date: string;
  endDate?: string;
  city: string;
  country: string;
  venue?: string;
  ticketsUrl?: string;
}

export interface GigCandidateUpsertApiParams {
  gig: GigCandidateUpsertPayload;
  poster: GigCandidatePosterSelection;
}

export interface GigCandidateCreateResponse {
  id: string;
}

function asRecordOrThrow(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    throw new Error('Invalid API response: expected an object');
  }
  return raw;
}

function parseGigCandidateCreateResponse(raw: unknown): GigCandidateCreateResponse {
  const obj = asRecordOrThrow(raw);
  const id = obj.id;
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('Invalid API response: "id" must be a non-empty string');
  }
  return { id };
}

function getPosterUrlOrUndefined(poster: GigCandidatePosterSelection): string | undefined {
  if (poster.mode !== 'url') return undefined;
  const trimmed = (poster.url ?? '').trim();
  if (!trimmed) return undefined;
  new URL(trimmed);
  return trimmed;
}

export async function createGigCandidate(
  params: GigCandidateUpsertApiParams,
): Promise<GigCandidateCreateResponse> {
  const gig: GigCandidateUpsertPayload = {
    title: params.gig.title,
    date: params.gig.date,
    endDate: params.gig.endDate || undefined,
    city: params.gig.city,
    country: params.gig.country,
    venue: params.gig.venue || undefined,
    ticketsUrl: params.gig.ticketsUrl || undefined,
  };

  const posterUrl = getPosterUrlOrUndefined(params.poster);

  let raw: unknown;
  if (params.poster.mode === 'upload' && params.poster.file) {
    const fd = new FormData();
    fd.append('posterFile', params.poster.file);
    fd.append('gig', JSON.stringify(gig));
    raw = await apiClientRequest<unknown, FormData>(GIG_CANDIDATES_ENDPOINT, 'POST', fd);
  } else if (posterUrl) {
    raw = await apiClientRequest<unknown>(GIG_CANDIDATES_ENDPOINT, 'POST', {
      gig: { ...gig, posterUrl },
    });
  } else {
    raw = await apiClientRequest<unknown>(GIG_CANDIDATES_ENDPOINT, 'POST', { gig });
  }

  return parseGigCandidateCreateResponse(raw);
}
