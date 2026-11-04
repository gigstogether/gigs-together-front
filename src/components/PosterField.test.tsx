// @vitest-environment jsdom

import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import PosterField from '@/components/PosterField';
import { toast } from '@/hooks/use-toast';

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

interface RenderPosterFieldResult {
  onPosterFileChange: ReturnType<typeof vi.fn>;
}

function renderPosterField(): RenderPosterFieldResult {
  const onPosterFileChange = vi.fn();

  render(
    <PosterField
      posterFile={null}
      onPosterFileChange={onPosterFileChange}
      posterUrl=""
      onPosterUrlChange={vi.fn()}
      onClearPoster={vi.fn()}
      posterFileInputRef={createRef<HTMLInputElement>()}
    />,
  );

  return { onPosterFileChange };
}

describe('PosterField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['SVG MIME type', new File(['<svg></svg>'], 'poster', { type: 'image/svg+xml' })],
    ['SVG extension', new File(['<svg></svg>'], 'poster.svg', { type: '' })],
    ['GIF MIME type', new File(['gif'], 'poster.gif', { type: 'image/gif' })],
  ])('should reject an unsupported file identified by %s', (_, file) => {
    const { onPosterFileChange } = renderPosterField();

    fireEvent.change(screen.getByLabelText('Poster:'), {
      target: { files: [file] },
    });

    expect(onPosterFileChange).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      title: 'Unsupported poster format',
      description: 'Please use JPEG, PNG, WebP, AVIF, or HEIC/HEIF.',
      variant: 'destructive',
    });
  });

  it.each([
    ['PNG MIME type', new File(['png'], 'poster', { type: 'image/png' })],
    ['AVIF MIME type', new File(['avif'], 'poster', { type: 'image/avif' })],
    ['HEIC extension', new File(['heic'], 'poster.heic', { type: '' })],
    ['HEIF extension', new File(['heif'], 'poster.heif', { type: '' })],
  ])('should accept a supported file identified by %s', (_, file) => {
    const { onPosterFileChange } = renderPosterField();

    fireEvent.change(screen.getByLabelText('Poster:'), {
      target: { files: [file] },
    });

    expect(onPosterFileChange).toHaveBeenCalledWith(file);
  });

  it('should restrict the file picker to supported poster formats', () => {
    renderPosterField();

    expect(screen.getByLabelText('Poster:')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif',
    );
  });

  it('should reject an SVG image pasted from the clipboard', () => {
    const { onPosterFileChange } = renderPosterField();
    const file = new File(['<svg></svg>'], 'poster.svg', { type: 'image/svg+xml' });

    fireEvent.paste(screen.getByLabelText('Poster URL'), {
      clipboardData: {
        items: [
          {
            kind: 'file',
            type: 'image/svg+xml',
            getAsFile: () => file,
          },
        ],
      },
    });

    expect(onPosterFileChange).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      title: 'Unsupported poster format',
      description: 'Please use JPEG, PNG, WebP, AVIF, or HEIC/HEIF.',
      variant: 'destructive',
    });
  });
});
