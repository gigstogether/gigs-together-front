import { ImagePreview } from '@/components/ImagePreview';

export interface GigPosterProps {
  poster: string;
  title: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function GigPoster(props: GigPosterProps) {
  const { poster, title, loading = 'lazy', fetchPriority } = props;

  return (
    <ImagePreview
      src={poster}
      alt={title}
      openLabel={`Open poster: ${title}`}
      fit="cover"
      aspectRatioClassName="aspect-[3/4]"
      loading={loading}
      fetchPriority={fetchPriority}
    />
  );
}
