// @vitest-environment jsdom

import { render } from '@testing-library/react';

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
  useQuery: () => ({ data: { gigs: [] }, isError: false, isLoading: false }),
}));
vi.mock('./AdminGigPreviewCard', () => ({ default: () => null }));
vi.mock('./AdminGigQueueList', () => ({ default: () => null }));
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
});
