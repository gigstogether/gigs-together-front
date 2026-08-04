import { GigPoster } from '@/components/GigPoster';

interface AdminGigPreviewPosterProps {
  readonly posterUrl?: string;
  readonly title: string;
}

// TODO: unite all poster components to a common component?
export default function AdminGigPreviewPoster(props: AdminGigPreviewPosterProps) {
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
