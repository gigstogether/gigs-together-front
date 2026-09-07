// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import EditGigFormClient from '@/app/admin/gigs/_components/EditGigFormClient';

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockOnSubmit = vi.fn();
const mockRetryLoadingGig = vi.fn<() => Promise<void>>();

const mockUseEditGigFormData = vi.fn();
const mockUseGigSubmit = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/app/admin/gigs/_hooks/useEditGigFormData', () => ({
  useEditGigFormData: (...args: Parameters<typeof mockUseEditGigFormData>) =>
    mockUseEditGigFormData(...args),
}));

vi.mock('@/app/admin/gigs/_hooks/useGigSubmit', () => ({
  useGigSubmit: (...args: Parameters<typeof mockUseGigSubmit>) => mockUseGigSubmit(...args),
}));

vi.mock('@/app/admin/gigs/_components/gig-form/GigFormFields', () => ({
  default: () => <div data-testid="gig-form-fields" />,
}));

vi.mock('@/components/PosterField', () => ({
  default: () => <div data-testid="poster-field" />,
}));

function renderClient() {
  return render(
    <EditGigFormClient
      countries={[{ iso: 'ES' }]}
      gigPublicId="radiohead-barcelona"
    />,
  );
}

describe('EditGigFormClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGigSubmit.mockReturnValue({
      isSubmitting: false,
      onSubmit: mockOnSubmit,
    });
  });

  it('should show the edit form without a removed Gig status badge', () => {
    mockUseEditGigFormData.mockReturnValue({
      existingPosterUrl: 'https://images.example/poster.png',
      gigVersion: 4,
      isLoadingGig: false,
      loadGigError: null,
      isPrefilled: true,
      retryLoadingGig: mockRetryLoadingGig,
    });

    renderClient();

    expect(screen.getByText('Edit gig')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Status:/)).not.toBeInTheDocument();
  });

  it('should not show gig status while edit data is still unavailable', () => {
    mockUseEditGigFormData.mockReturnValue({
      existingPosterUrl: '',
      gigVersion: null,
      isLoadingGig: false,
      loadGigError: null,
      isPrefilled: true,
      retryLoadingGig: mockRetryLoadingGig,
    });

    renderClient();

    expect(screen.queryByLabelText(/Status:/)).not.toBeInTheDocument();
  });
});
