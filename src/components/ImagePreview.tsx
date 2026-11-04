import { useCallback, useRef, useState } from 'react';

import { ImageLightbox } from '@/components/ImageLightbox';
import { cn } from '@/lib/utils';

type ImagePreviewFit = 'cover' | 'contain';

export interface ImagePreviewProps {
  src: string;
  alt: string;
  openLabel: string;
  fit: ImagePreviewFit;
  aspectRatioClassName?: string;
  imageClassName?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

const IMAGE_FIT_CLASS_NAMES: Record<ImagePreviewFit, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
};

export function ImagePreview(props: ImagePreviewProps) {
  const {
    src,
    alt,
    openLabel,
    fit,
    aspectRatioClassName,
    imageClassName,
    loading = 'lazy',
    fetchPriority,
  } = props;

  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const isLoaded = loadedSrc === src;
  const hasConstrainedAspectRatio = aspectRatioClassName !== undefined;

  // If the image is already cached, remove the loading background immediately.
  const imgRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete) setLoadedSrc(src);
    },
    [src],
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'relative w-full cursor-zoom-in overflow-hidden rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40 dark:bg-gray-700',
          aspectRatioClassName,
        )}
        aria-label={openLabel}
        aria-haspopup="dialog"
      >
        {/* TODO: Consider using `<Image />` from `next/image`  */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={cn(
            hasConstrainedAspectRatio ? 'h-full w-full' : 'h-auto w-full',
            IMAGE_FIT_CLASS_NAMES[fit],
            'bg-gray-200 dark:bg-gray-700',
            imageClassName,
            !isLoaded && 'skeleton-shimmer',
          )}
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setLoadedSrc(src)}
        />
      </button>

      <ImageLightbox
        open={open}
        src={src}
        alt={alt}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
      />
    </>
  );
}
