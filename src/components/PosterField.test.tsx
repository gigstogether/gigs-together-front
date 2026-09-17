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
  ])('should reject a file identified by %s', (_, file) => {
    const { onPosterFileChange } = renderPosterField();

    fireEvent.change(screen.getByLabelText('Poster:'), {
      target: { files: [file] },
    });

    expect(onPosterFileChange).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      title: 'SVG posters are not supported',
      description: 'Please use a raster image instead.',
      variant: 'destructive',
    });
  });

  it('should accept an image file', () => {
    const { onPosterFileChange } = renderPosterField();
    const file = new File(['png'], 'poster.png', { type: 'image/png' });

    fireEvent.change(screen.getByLabelText('Poster:'), {
      target: { files: [file] },
    });

    expect(onPosterFileChange).toHaveBeenCalledWith(file);
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
      title: 'SVG posters are not supported',
      description: 'Please use a raster image instead.',
      variant: 'destructive',
    });
  });
});
