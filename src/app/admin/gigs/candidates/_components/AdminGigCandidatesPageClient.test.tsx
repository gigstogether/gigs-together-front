// @vitest-environment jsdom

import { render } from '@testing-library/react';

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
    data: { gigCandidates: [] },
    isError: false,
    isLoading: false,
  }),
}));
vi.mock('./AdminGigCandidatePreviewCard', () => ({ default: () => null }));
vi.mock('./AdminGigCandidateQueueList', () => ({ default: () => null }));
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
});
