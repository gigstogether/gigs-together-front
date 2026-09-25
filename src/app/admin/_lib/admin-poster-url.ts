export function buildVersionedAdminPosterUrl(posterUrl: string, version: number): string {
  // Bucket object keys stay stable, so the entity version makes replaced bytes a new browser URL.
  const versionedPosterUrl = new URL(posterUrl);
  versionedPosterUrl.searchParams.set('v', String(version));
  return versionedPosterUrl.toString();
}
