import { render, screen } from '@testing-library/react';

import { GigCard } from '@/app/feed/_components/GigCard';
import type { Event } from '@/lib/types';

vi.mock('@/components/GigPoster', () => ({
  GigPoster: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('@/components/ShareButton', () => ({
  ShareButton: () => <button aria-label="Copy link">Copy link</button>,
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: {
    telegramUrl: undefined,
  },
}));

describe('GigCard', () => {
  it('should render the title as plain text and show the share button', () => {
    const gig: Event = {
      id: 'radiohead barcelona',
      title: 'Radiohead',
      date: '2026-06-12',
      locality: {
        id: 'locality-id',
        countryIso: 'ES',
        name: 'Barcelona',
        qualifier: 'Catalonia',
      },
      venues: [
        { id: 'venue-1', name: 'Palau Sant Jordi' },
        { id: 'venue-2', name: 'Sala Apolo' },
      ],
    };

    render(<GigCard gig={gig} />);

    expect(screen.getByText('Radiohead')).toHaveClass('truncate');
    expect(screen.queryByRole('link', { name: 'Radiohead' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
    expect(screen.getByText('· Barcelona (Catalonia), Spain')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open Palau Sant Jordi in Google Maps' }),
    ).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=Palau%20Sant%20Jordi%20Barcelona%20(Catalonia)%20Spain',
    );
    expect(screen.getByRole('link', { name: 'Open Sala Apolo in Google Maps' })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=Sala%20Apolo%20Barcelona%20(Catalonia)%20Spain',
    );
  });
});
