import { fireEvent, render, screen } from '@testing-library/react';

import { ImageLightbox } from '@/components/ImageLightbox';

describe('ImageLightbox', () => {
  it('should close when the area outside the image is clicked', () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox
        open
        src="https://cdn.example/poster.jpg"
        alt="Gig poster"
        onClose={onClose}
      />,
    );
    const imageContainer = screen.getByRole('img', { name: 'Gig poster' }).parentElement;
    if (!imageContainer) throw new Error('Expected the image to have a lightbox container.');

    fireEvent.click(imageContainer);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should remain open when the image is clicked', () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox
        open
        src="https://cdn.example/poster.jpg"
        alt="Gig poster"
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('img', { name: 'Gig poster' }));

    expect(onClose).not.toHaveBeenCalled();
  });
});
