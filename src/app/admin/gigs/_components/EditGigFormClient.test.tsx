// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import EditGigFormClient from '@/app/admin/gigs/_components/EditGigFormClient';
import { GigStatusAPI } from '@/app/admin/gigs/_lib/types';

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockOnLookup = vi.fn<() => Promise<void>>();
const mockOnSubmit = vi.fn();
const mockRetryLoadingGig = vi.fn<() => Promise<void>>();

const mockUseEditGigFormData = vi.fn();
const mockUseGigLookup = vi.fn();
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

vi.mock('@/app/admin/gigs/_hooks/useGigLookup', () => ({
  useGigLookup: (...args: Parameters<typeof mockUseGigLookup>) => mockUseGigLookup(...args),
}));

vi.mock('@/app/admin/gigs/_hooks/useGigSubmit', () => ({
  useGigSubmit: (...args: Parameters<typeof mockUseGigSubmit>) => mockUseGigSubmit(...args),
}));

vi.mock('@/app/admin/gigs/_components/gig-form/GigFormFields', () => ({
  default: () => <div data-testid="gig-form-fields" />,
}));

vi.mock('@/app/admin/gigs/_components/gig-form/PosterField', () => ({
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

    mockUseGigLookup.mockReturnValue({
      isLookingUp: false,
      onLookup: mockOnLookup,
    });

    mockUseGigSubmit.mockReturnValue({
      isSubmitting: false,
      onSubmit: mockOnSubmit,
    });
  });

  it('should show gig status in the edit form when data is prefilled', () => {
    mockUseEditGigFormData.mockReturnValue({
      existingPosterUrl: 'https://images.example/poster.png',
      gigStatus: GigStatusAPI.Published,
      isLoadingGig: false,
      loadGigError: null,
      isPrefilled: true,
      retryLoadingGig: mockRetryLoadingGig,
    });

    renderClient();

    expect(screen.getByLabelText('Status: Published')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('should not show gig status while edit data is still unavailable', () => {
    mockUseEditGigFormData.mockReturnValue({
      existingPosterUrl: '',
      gigStatus: null,
      isLoadingGig: false,
      loadGigError: null,
      isPrefilled: true,
      retryLoadingGig: mockRetryLoadingGig,
    });

    renderClient();

    expect(screen.queryByLabelText(/Status:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Published')).not.toBeInTheDocument();
  });
});
