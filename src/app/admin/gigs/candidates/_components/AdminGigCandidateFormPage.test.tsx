// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import AdminGigCandidateFormPage from '@/app/admin/gigs/candidates/_components/AdminGigCandidateFormPage';

const { getCountriesMock, getTranslationsMock } = vi.hoisted(() => ({
  getCountriesMock: vi.fn(),
  getTranslationsMock: vi.fn(),
}));

vi.mock('@/lib/countries.server', () => ({ getCountries: getCountriesMock }));
vi.mock('@/lib/i18n/translations.server', () => ({
  getTranslations: getTranslationsMock,
}));
vi.mock('@/app/admin/gigs/candidates/_components/AdminGigCandidateDraftForm', () => ({
  default: () => <div>Create Gig Candidate form</div>,
}));
vi.mock('@/app/admin/gigs/candidates/_components/AdminGigCandidateDetailPageClient', () => ({
  default: (props: { gigCandidateId: string }) => (
    <div>Edit Gig Candidate {props.gigCandidateId}</div>
  ),
}));

describe('AdminGigCandidateFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCountriesMock.mockResolvedValue([]);
    getTranslationsMock.mockResolvedValue({ locale: 'en', translations: {} });
  });

  it('should render the shared create flow', async () => {
    render(await AdminGigCandidateFormPage({ mode: 'create' }));

    expect(screen.getByRole('link', { name: /Gig Candidates/ })).toHaveAttribute(
      'href',
      '/admin/gigs/candidates',
    );
    expect(screen.getByText('Create Gig Candidate form')).toBeInTheDocument();
  });

  it('should render the shared edit flow for the requested Gig Candidate', async () => {
    render(
      await AdminGigCandidateFormPage({
        mode: 'edit',
        gigCandidateId: 'gigCandidate-42',
      }),
    );

    expect(screen.getByText('Edit Gig Candidate gigCandidate-42')).toBeInTheDocument();
    expect(getCountriesMock).toHaveBeenCalledTimes(1);
    expect(getTranslationsMock).toHaveBeenCalledWith('en', 'country');
  });
});
