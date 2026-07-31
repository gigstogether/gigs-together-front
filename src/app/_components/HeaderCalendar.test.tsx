import { render, screen } from '@testing-library/react';

vi.mock('server-only', () => ({}));

const mockGetFeedAvailableDates = vi.hoisted(() => vi.fn());

vi.mock('@/lib/feed.server', () => ({
  getFeedAvailableDates: mockGetFeedAvailableDates,
}));

vi.mock('@/app/_components/HeaderCalendarClient', () => ({
  default: ({ availableDates }: { availableDates: readonly string[] }) => (
    <div data-testid="header-calendar-client">{availableDates.join(',')}</div>
  ),
}));

describe('HeaderCalendar', () => {
  beforeEach(() => {
    mockGetFeedAvailableDates.mockReset();
    mockGetFeedAvailableDates.mockResolvedValue(['2026-04-21', '2026-05-01']);
  });

  it('should fetch available dates and pass them to the client calendar', async () => {
    const HeaderCalendar = (await import('@/app/_components/HeaderCalendar'))
      .default;

    render(
      await HeaderCalendar({
        country: 'es',
        city: 'barcelona',
      }),
    );

    expect(mockGetFeedAvailableDates).toHaveBeenCalledWith({
      country: 'es',
      city: 'barcelona',
    });
    expect(screen.getByTestId('header-calendar-client')).toHaveTextContent('2026-04-21,2026-05-01');
  });
});
