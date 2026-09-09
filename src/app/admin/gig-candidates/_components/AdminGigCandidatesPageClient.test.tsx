// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';

import AdminGigCandidatesPageClient from './AdminGigCandidatesPageClient';

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
      gigCandidates: [
        {
          id: 'first-gig-candidate',
          gigDraft: { title: 'First Gig Candidate' },
        },
        {
          id: 'second-gig-candidate',
          gigDraft: { title: 'Second Gig Candidate' },
        },
      ],
    },
    isError: false,
    isLoading: false,
  }),
}));
vi.mock('./AdminGigCandidatePreviewCard', () => ({ default: () => null }));
vi.mock('./AdminGigCandidatesFilterControls', () => ({ default: () => null }));
vi.mock('./AdminGigCandidatesSortControls', () => ({ default: () => null }));

describe('AdminGigCandidatesPageClient query sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not replace an already canonical query on mount', () => {
    navigationMocks.useSearchParams.mockReturnValue(
      new URLSearchParams('status=new&sortBy=createdAt&sortOrder=desc'),
    );

    render(<AdminGigCandidatesPageClient />);

    expect(navigationMocks.replace).not.toHaveBeenCalled();
  });

  it('should replace a query that is missing the defaults', () => {
    navigationMocks.useSearchParams.mockReturnValue(new URLSearchParams());

    render(<AdminGigCandidatesPageClient />);

    expect(navigationMocks.replace).toHaveBeenCalledOnce();
    expect(navigationMocks.replace).toHaveBeenCalledWith(
      '?status=new&sortBy=createdAt&sortOrder=desc',
      { scroll: false },
    );
  });

  it('should not restore the initial selection after selecting another Gig Candidate', () => {
    navigationMocks.useSearchParams.mockReturnValue(
      new URLSearchParams('status=new&sortBy=createdAt&sortOrder=desc'),
    );
    const view = render(<AdminGigCandidatesPageClient />);

    fireEvent.click(screen.getByRole('option', { name: /Second Gig Candidate/ }));
    navigationMocks.replace.mockClear();
    navigationMocks.useSearchParams.mockReturnValue(
      new URLSearchParams(
        'status=new&sortBy=createdAt&sortOrder=desc&gigCandidate=second-gig-candidate',
      ),
    );
    view.rerender(<AdminGigCandidatesPageClient />);

    expect(navigationMocks.replace).not.toHaveBeenCalled();
  });
});
