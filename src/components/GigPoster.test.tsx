import { act, render, screen } from '@testing-library/react';

import { GigPoster } from '@/components/GigPoster';

vi.mock('@/components/ImageLightbox', () => ({
  ImageLightbox: () => null,
}));

describe('GigPoster', () => {
  it('should default to lazy loading when loading is not provided', () => {
    render(
      <GigPoster
        poster="https://cdn.example/poster.jpg"
        title="Radiohead"
      />,
    );

    const image = screen.getByRole('img', { name: 'Radiohead' });

    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveClass('object-cover');
    expect(screen.getByRole('button', { name: 'Open poster: Radiohead' })).toHaveClass(
      'aspect-[3/4]',
    );
  });

  it('should use eager loading and high fetch priority when configured', () => {
    render(
      <GigPoster
        poster="https://cdn.example/poster.jpg"
        title="Radiohead"
        loading="eager"
        fetchPriority="high"
      />,
    );

    const img = screen.getByRole('img', { name: 'Radiohead' });
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  it('should keep the image visible for LCP and show shimmer on the img until loaded', async () => {
    const { container } = render(
      <GigPoster
        poster="https://cdn.example/poster.jpg"
        title="Radiohead"
      />,
    );

    const img = screen.getByRole('img', { name: 'Radiohead' });
    expect(img).not.toHaveClass('opacity-0');
    expect(img).toHaveClass('skeleton-shimmer');

    await act(async () => {
      img.dispatchEvent(new Event('load'));
    });

    expect(container.querySelector('img')).not.toHaveClass('skeleton-shimmer');
  });
});
