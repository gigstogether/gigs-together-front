// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import AdminGigCandidateFormPage from '@/app/admin/gig-candidates/_components/AdminGigCandidateFormPage';

const { getCountriesMock, getRequiredCommunityByRouteMock } = vi.hoisted(() => ({
  getCountriesMock: vi.fn(),
  getRequiredCommunityByRouteMock: vi.fn(),
}));

vi.mock('@/lib/countries.server', () => ({ getCountries: getCountriesMock }));
vi.mock('@/lib/community/community.server', () => ({
  getRequiredCommunityByRoute: getRequiredCommunityByRouteMock,
}));
vi.mock('@/app/admin/gig-candidates/_components/AdminGigCandidateDraftForm', () => ({
  default: (props: { defaultCommunityId: string }) => (
    <div data-community-id={props.defaultCommunityId}>Create Gig Candidate form</div>
  ),
}));
vi.mock('@/app/admin/gig-candidates/_components/AdminGigCandidateDetailPageClient', () => ({
  default: (props: { defaultCommunityId: string; gigCandidateId: string }) => (
    <div data-community-id={props.defaultCommunityId}>
      Edit Gig Candidate {props.gigCandidateId}
    </div>
  ),
}));

describe('AdminGigCandidateFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCountriesMock.mockResolvedValue([]);
    getRequiredCommunityByRouteMock.mockResolvedValue({
      community: { id: 'community-id' },
      nameTranslationNamespace: 'community',
    });
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
