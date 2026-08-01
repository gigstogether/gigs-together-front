import { render, screen } from '@testing-library/react';

const mockUseHeaderConfig = vi.fn();

vi.mock('@/app/feed/_providers/HeaderConfigProvider', () => ({
  useHeaderConfig: () => mockUseHeaderConfig(),
}));

import HeaderCalendarClient from '@/app/feed/_components/HeaderCalendarClient';

describe('HeaderCalendarClient', () => {
  beforeEach(() => {
    mockUseHeaderConfig.mockReturnValue({
      config: {},
      setConfig: vi.fn(),
    });
  });

  it('should show the first available date in the header before feed scroll sync', () => {
    render(<HeaderCalendarClient availableDates={['2026-04-21', '2026-05-01']} />);

    expect(screen.getByText('April 2026')).toBeInTheDocument();
  });

  it('should prefer visible event date from header config over the first available date', () => {
    mockUseHeaderConfig.mockReturnValue({
      config: {
        earliestEventDate: '2026-05-15',
      },
      setConfig: vi.fn(),
    });

    render(<HeaderCalendarClient availableDates={['2026-04-21', '2026-05-01']} />);

    expect(screen.getByText('May 2026')).toBeInTheDocument();
  });

  it('should show a dash when there are no available dates and no scroll sync date', () => {
    render(<HeaderCalendarClient availableDates={[]} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
