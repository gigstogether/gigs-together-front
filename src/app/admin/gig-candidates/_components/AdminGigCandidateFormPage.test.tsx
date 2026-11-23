// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import AdminGigCandidateFormPage from '@/app/admin/gig-candidates/_components/AdminGigCandidateFormPage';

const { getCountriesMock, getCommunityDisplayOptionsMock } = vi.hoisted(() => ({
  getCountriesMock: vi.fn(),
  getCommunityDisplayOptionsMock: vi.fn(),
}));

vi.mock('@/lib/countries.server', () => ({ getCountries: getCountriesMock }));
vi.mock('@/lib/community/community-display-options.server', () => ({
  getCommunityDisplayOptions: getCommunityDisplayOptionsMock,
}));
vi.mock('@/app/admin/gig-candidates/_components/AdminGigCandidateDraftForm', () => ({
  default: (props: { communityOptions: { value: string }[] }) => (
    <div data-community-id={props.communityOptions[0]?.value}>Create Gig Candidate form</div>
  ),
}));
vi.mock('@/app/admin/gig-candidates/_components/AdminGigCandidateDetailPageClient', () => ({
  default: (props: { communityOptions: { value: string }[]; gigCandidateId: string }) => (
    <div data-community-id={props.communityOptions[0]?.value}>
      Edit Gig Candidate {props.gigCandidateId}
    </div>
  ),
}));

describe('AdminGigCandidateFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCountriesMock.mockResolvedValue([]);
    getCommunityDisplayOptionsMock.mockResolvedValue([
      { value: 'community-id', label: 'Barcelona' },
    ]);
  });

  it('should render the shared create flow', async () => {
    render(await AdminGigCandidateFormPage({ mode: 'create' }));

    expect(screen.getByRole('link', { name: /Gig Candidates/ })).toHaveAttribute(
      'href',
      '/admin/gig-candidates',
    );
    expect(screen.getByText('Create Gig Candidate form')).toHaveAttribute(
      'data-community-id',
      'community-id',
    );
  });

  it('should render the shared edit flow for the requested Gig Candidate', async () => {
    render(
      await AdminGigCandidateFormPage({
        mode: 'edit',
        gigCandidateId: 'gigCandidate-42',
      }),
    );

    expect(screen.getByText('Edit Gig Candidate gigCandidate-42')).toHaveAttribute(
      'data-community-id',
      'community-id',
    );
    expect(getCountriesMock).toHaveBeenCalledTimes(1);
  });
});
