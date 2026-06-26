import { render, screen } from '@testing-library/react';

import { GigCard } from '@/app/_components/GigCard';
import type { Event } from '@/lib/types';

vi.mock('@/app/_components/GigPoster', () => ({
  GigPoster: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    telegramUrl: undefined,
  },
}));

describe('GigCard', () => {
  it('should render the title as plain text', () => {
    const gig: Event = {
      id: 'radiohead barcelona',
      title: 'Radiohead',
      date: '2026-06-12',
      venue: 'Palau Sant Jordi',
      city: 'barcelona',
      country: {
        iso: 'ES',
        name: 'Spain',
      },
    };

    render(<GigCard gig={gig} />);

    expect(screen.getByText('Radiohead')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Radiohead' })).not.toBeInTheDocument();
  });
});
