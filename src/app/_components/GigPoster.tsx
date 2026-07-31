import { useCallback, useRef, useState } from 'react';
import { ImageLightbox } from '@/app/_components/ImageLightbox';
import { cn } from '@/lib/utils';

export interface GigPosterProps {
  poster: string;
  title: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function GigPoster(props: GigPosterProps) {
  const { poster, title, loading = 'lazy', fetchPriority } = props;

  const [loadedPoster, setLoadedPoster] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const isLoaded = loadedPoster === poster;

  // If the image is already cached, remove the loading background immediately.
  const imgRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete) setLoadedPoster(poster);
    },
    [poster],
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        aria-label={`Open poster: ${title}`}
        aria-haspopup="dialog"
      >
        {/* TODO: Consider using `<Image />` from `next/image`  */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={cn(
            'h-full w-full object-cover bg-gray-200 dark:bg-gray-700',
            !isLoaded && 'skeleton-shimmer',
          )}
          ref={imgRef}
          src={poster}
          alt={title}
          loading={loading}
          fetchPriority={fetchPriority}
          onLoad={() => setLoadedPoster(poster)}
          onError={() => setLoadedPoster(poster)}
        />
      </button>

      <ImageLightbox
        open={open}
        src={poster}
        alt={title}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
      />
    </>
  );
}
