import { render, screen } from '@testing-library/react';

vi.mock('server-only', () => ({}));

const mockGetAvailableGigDates = vi.hoisted(() => vi.fn());

vi.mock('@/app/feed/_lib/get-available-gig-dates.server', () => ({
  getAvailableGigDates: mockGetAvailableGigDates,
}));

vi.mock('@/app/feed/_components/HeaderCalendarClient', () => ({
  default: ({ availableDates }: { availableDates: readonly string[] }) => (
    <div data-testid="header-calendar-client">{availableDates.join(',')}</div>
  ),
}));

describe('HeaderCalendar', () => {
  beforeEach(() => {
    mockGetAvailableGigDates.mockReset();
    mockGetAvailableGigDates.mockResolvedValue(['2026-04-21', '2026-05-01']);
  });

  it('should fetch available dates and pass them to the client calendar', async () => {
    const HeaderCalendar = (await import('@/app/feed/_components/HeaderCalendar')).default;

    render(
      await HeaderCalendar({
        country: 'es',
        city: 'barcelona',
      }),
    );

    expect(mockGetAvailableGigDates).toHaveBeenCalledWith({
      country: 'es',
      city: 'barcelona',
    });
    expect(screen.getByTestId('header-calendar-client')).toHaveTextContent('2026-04-21,2026-05-01');
  });
});
