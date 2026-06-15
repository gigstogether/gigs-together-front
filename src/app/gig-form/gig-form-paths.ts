export const ADMIN_GIGS_BASE_PATH = '/admin/gigs';

export function buildGigFormPublicIdPath(basePath: string, publicId: string): string {
  const trimmedBase = basePath.replace(/\/$/, '');
  const trimmedId = publicId.trim();
  if (!trimmedId) {
    throw new Error('publicId is required');
  }
  return `${trimmedBase}/${encodeURIComponent(trimmedId)}`;
}

export function buildGigFormEditPath(basePath: string, publicId: string): string {
  return `${buildGigFormPublicIdPath(basePath, publicId)}/edit`;
}
