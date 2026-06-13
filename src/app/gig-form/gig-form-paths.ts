export const GIG_FORM_ADMIN_BASE_PATH = '/admin/gigs';

export function buildGigFormEditPath(basePath: string, publicId: string): string {
  const trimmedBase = basePath.replace(/\/$/, '');
  const trimmedId = publicId.trim();
  if (!trimmedId) {
    throw new Error('publicId is required');
  }
  return `${trimmedBase}/${encodeURIComponent(trimmedId)}/edit`;
}
