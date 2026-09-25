import { GigPoster } from '@/components/GigPoster';
import { buildVersionedAdminPosterUrl } from '@/app/admin/_lib/admin-poster-url';

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
    resolvedPosterUrl = buildVersionedAdminPosterUrl(posterUrl, posterVersion);
  }

  return (
    <GigPoster
      poster={resolvedPosterUrl}
      title={title}
    />
  );
}
