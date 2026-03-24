'use client';

import { useCallback, useEffect, useMemo } from 'react';
import type { ChangeEvent, ClipboardEvent, RefObject } from 'react';

import { GigPoster } from '@/app/_components/GigPoster';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface PosterFieldProps {
  posterFile: File | null;
  onPosterFileChange: (file: File | null) => void;
  posterUrl: string;
  onPosterUrlChange: (url: string) => void;
  onClearPoster: () => void;
  posterFileInputRef: RefObject<HTMLInputElement | null>;
  existingPosterUrl?: string;
  variant?: 'create' | 'edit';
}

export default function PosterField(props: PosterFieldProps) {
  const {
    posterFile,
    onPosterFileChange,
    posterUrl,
    onPosterUrlChange,
    onClearPoster,
    posterFileInputRef,
    existingPosterUrl,
    variant,
  } = props;

  const isEdit = variant === 'edit';

  const localPreviewUrl = useMemo(() => {
    if (!posterFile) {
      return null;
    }

    return URL.createObjectURL(posterFile);
  }, [posterFile]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const previewSrc = posterFile
    ? localPreviewUrl
    : posterUrl?.trim()
      ? posterUrl.trim()
      : isEdit
        ? existingPosterUrl
        : undefined;

  const isPosterSelected = !!posterFile || !!posterUrl?.trim();

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLDivElement | HTMLInputElement>) => {
      const items = event.clipboardData?.items;
      if (!items) {
        return;
      }

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) {
            continue;
          }

          event.preventDefault();
          onPosterUrlChange('');
          onPosterFileChange(file);
          if (posterFileInputRef.current) {
            posterFileInputRef.current.value = '';
          }
          break;
        }
      }
    },
    [onPosterFileChange, onPosterUrlChange, posterFileInputRef],
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      onPosterFileChange(file);
      if (file) {
        onPosterUrlChange('');
      }
    },
    [onPosterFileChange, onPosterUrlChange],
  );

  const description = isEdit
    ? 'Upload a new image file, paste URL, or paste image from clipboard (optional).'
    : 'Upload an image file (max 10MB), paste URL, or paste image from clipboard.';

  return (
    <Field>
      <FieldLabel htmlFor="poster-file">Poster:</FieldLabel>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            id="poster-file"
            ref={posterFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={onClearPoster}
            disabled={!isPosterSelected}
          >
            Clear
          </Button>
        </div>

        <Input
          type="url"
          placeholder="Or paste poster URL or image (Ctrl+V)"
          value={posterUrl ?? ''}
          onChange={(event) => {
            const nextValue = event.target.value;
            onPosterUrlChange(nextValue);
            if (nextValue.trim()) {
              onPosterFileChange(null);
              if (posterFileInputRef.current) {
                posterFileInputRef.current.value = '';
              }
            }
          }}
          onPaste={handlePaste}
        />
      </div>

      {previewSrc ? (
        <div className="mt-2">
          <GigPoster poster={previewSrc} title="Poster preview" />
        </div>
      ) : null}

      <FieldDescription>
        <span>
          {isEdit && existingPosterUrl ? (
            <>
              Current poster:{' '}
              <a
                href={existingPosterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                open
              </a>
              .{' '}
            </>
          ) : null}
          {description}
        </span>
      </FieldDescription>
    </Field>
  );
}
