import { render, screen } from '@testing-library/react';

import { FeedMonths } from '@/app/feed/_components/FeedMonths';
import type { Event } from '@/lib/types';

vi.mock('@/app/feed/_components/GigCard', () => ({
  GigCard: ({
    gig,
    posterLoading,
    posterFetchPriority,
  }: {
    gig: Event;
    posterLoading?: 'eager' | 'lazy';
    posterFetchPriority?: 'high' | 'low' | 'auto';
  }) => (
    <div
      data-testid={`gig-${gig.id}`}
      data-poster-loading={posterLoading ?? 'lazy'}
      data-poster-fetch-priority={posterFetchPriority ?? 'none'}
    >
      {gig.title}
    </div>
  ),
}));

const event = (id: string): Event => ({
  id,
  title: id,
  date: '2026-06-12',
  venue: 'Palau Sant Jordi',
  city: { code: 'barcelona', name: 'Barcelona' },
  country: { iso: 'ES', name: 'Spain' },
});

describe('FeedMonths', () => {
  it('should mark initial-batch posters as eager and prioritize the first one', () => {
    render(
      <FeedMonths
        events={[event('first'), event('second'), event('third')]}
        registerEventRef={() => undefined}
        eagerPosterIds={['first', 'second']}
        priorityPosterId="first"
      />,
    );

    expect(screen.getByTestId('gig-first')).toHaveAttribute('data-poster-loading', 'eager');
    expect(screen.getByTestId('gig-first')).toHaveAttribute('data-poster-fetch-priority', 'high');
    expect(screen.getByTestId('gig-second')).toHaveAttribute('data-poster-loading', 'eager');
    expect(screen.getByTestId('gig-second')).toHaveAttribute('data-poster-fetch-priority', 'none');
    expect(screen.getByTestId('gig-third')).toHaveAttribute('data-poster-loading', 'lazy');
  });
});
