import { GigPoster } from '@/components/GigPoster';

interface AdminPreviewPosterProps {
  posterUrl?: string;
  posterVersion?: number;
  title: string;
}

export default function AdminPreviewPoster(props: AdminPreviewPosterProps) {
  const { posterUrl, posterVersion, title } = props;

  if (!posterUrl) {
    return (
      <div
        className="w-full aspect-[3/4] rounded-lg bg-gray-100 dark:bg-gray-700"
        aria-label="No poster"
      />
    );
  }

  let resolvedPosterUrl = posterUrl;
  if (posterVersion !== undefined) {
    // Bucket object keys stay stable, so the Gig version makes replaced bytes a new browser URL.
    const versionedPosterUrl = new URL(posterUrl);
    versionedPosterUrl.searchParams.set('v', String(posterVersion));
    resolvedPosterUrl = versionedPosterUrl.toString();
  }

  return (
    <GigPoster
      poster={resolvedPosterUrl}
      title={title}
    />
  );
}
