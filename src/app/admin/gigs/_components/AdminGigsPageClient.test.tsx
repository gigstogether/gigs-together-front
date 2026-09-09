// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';

import AdminGigsPageClient from './AdminGigsPageClient';

const navigationMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navigationMocks.replace }),
  useSearchParams: navigationMocks.useSearchParams,
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      gigs: [
        {
          publicId: 'first-gig',
          title: 'First Gig',
          date: '2026-09-17',
        },
        {
          publicId: 'second-gig',
          title: 'Second Gig',
          date: '2026-09-18',
        },
      ],
    },
    isError: false,
    isLoading: false,
  }),
}));
vi.mock('./AdminGigPreviewCard', () => ({ default: () => null }));
vi.mock('./AdminGigsSortControls', () => ({ default: () => null }));

describe('AdminGigsPageClient query sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not replace an already canonical query on mount', () => {
    navigationMocks.useSearchParams.mockReturnValue(
      new URLSearchParams('sortBy=createdAt&sortOrder=desc'),
    );

    render(<AdminGigsPageClient />);

    expect(navigationMocks.replace).not.toHaveBeenCalled();
  });

  it('should replace a query that is missing the defaults', () => {
    navigationMocks.useSearchParams.mockReturnValue(new URLSearchParams());

    render(<AdminGigsPageClient />);

    expect(navigationMocks.replace).toHaveBeenCalledOnce();
    expect(navigationMocks.replace).toHaveBeenCalledWith('?sortBy=createdAt&sortOrder=desc', {
      scroll: false,
    });
  });

  it('should not restore the initial selection after selecting another Gig', () => {
    navigationMocks.useSearchParams.mockReturnValue(
      new URLSearchParams('sortBy=createdAt&sortOrder=desc'),
    );
    const view = render(<AdminGigsPageClient />);

    fireEvent.click(screen.getByRole('option', { name: /Second Gig/ }));
    navigationMocks.replace.mockClear();
    navigationMocks.useSearchParams.mockReturnValue(
      new URLSearchParams('sortBy=createdAt&sortOrder=desc&gig=second-gig'),
    );
    view.rerender(<AdminGigsPageClient />);

    expect(navigationMocks.replace).not.toHaveBeenCalled();
  });
});
