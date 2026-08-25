import { GigPoster } from '@/components/GigPoster';

interface AdminPreviewPosterProps {
  posterUrl?: string;
  title: string;
}

export default function AdminPreviewPoster(props: AdminPreviewPosterProps) {
  const { posterUrl, title } = props;

  if (!posterUrl) {
    return (
      <div
        className="w-full aspect-[3/4] rounded-lg bg-gray-100 dark:bg-gray-700"
        aria-label="No poster"
      />
    );
  }

  return (
    <GigPoster
      poster={posterUrl}
      title={title}
    />
  );
}
