import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import SuggestGigPageClient from './SuggestGigPageClient';
import type { CommunityDisplayOption } from '@/lib/community/community-display-option';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';

const { apiPublicRequestMock, createGigCandidateMock } = vi.hoisted(() => ({
  apiPublicRequestMock: vi.fn(),
  createGigCandidateMock: vi.fn(),
}));

vi.mock('@/lib/api-public', () => ({
  apiPublicRequest: apiPublicRequestMock,
}));

vi.mock('../_lib/gig-candidate-api', () => ({
  createGigCandidate: createGigCandidateMock,
}));

const COMMUNITY_OPTIONS: CommunityDisplayOption[] = [
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'madrid', label: 'Madrid' },
];
const LOCALITY = {
  id: 'madrid-locality',
  countryIso: 'ES',
  name: 'Madrid',
  timeZone: 'Europe/Madrid',
};

function renderPage(communityOptions = COMMUNITY_OPTIONS, communitySelectionHint?: string) {
  return render(
    <SuggestGigPageClient
      communityOptions={communityOptions}
      countries={[{ iso: 'ES', name: 'Spain' }]}
      communitySelectionHint={communitySelectionHint}
    />,
    { wrapper: createQueryClientWrapper(createTestQueryClient()) },
  );
}

async function submitGigForMadrid(ticketsUrl?: string): Promise<void> {
  renderPage();
  fireEvent.click(screen.getByRole('combobox', { name: 'Choose a community' }));
  fireEvent.click(screen.getByRole('option', { name: 'Barcelona' }));
  fireEvent.change(screen.getByLabelText('Title:*'), { target: { value: 'Muse' } });
  fireEvent.click(screen.getByRole('combobox', { name: 'Community' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search communities' }), {
    target: { value: 'Madrid' },
  });
  fireEvent.click(screen.getByRole('option', { name: 'Madrid' }));
  if (ticketsUrl !== undefined) {
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.change(screen.getByLabelText('Tickets URL:'), { target: { value: ticketsUrl } });
    fireEvent.click(screen.getByRole('button', { name: 'Hide details' }));
  }
  const localitySelect = screen.getByRole('combobox', { name: 'Locality:' });
  await waitFor(() => expect(localitySelect).toBeEnabled());
  fireEvent.click(localitySelect);
  fireEvent.click(screen.getByRole('option', { name: 'Madrid' }));
  fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));
  await screen.findByText('Suggestion received');
}

describe('SuggestGigPageClient', () => {
  beforeEach(() => {
    createGigCandidateMock.mockReset().mockResolvedValue({ id: 'candidate-id' });
    apiPublicRequestMock.mockReset().mockImplementation((endpoint: string) => {
      if (endpoint === '/v1/localities?countryIso=ES') {
        return Promise.resolve({ localities: [LOCALITY] });
      }
      if (endpoint === '/v1/venues?localityId=madrid-locality') {
        return Promise.resolve({ locality: LOCALITY, venues: [] });
      }
      throw new Error(`Unexpected endpoint: ${endpoint}`);
    });
  });

  it('should display one required community selector when only one community is available', () => {
    renderPage([COMMUNITY_OPTIONS[0]]);

    const communitySelect = screen.getByRole('combobox', { name: 'Community' });

    expect(communitySelect).toHaveTextContent('Barcelona');
    expect(communitySelect).toHaveAccessibleDescription('Change community');
    expect(communitySelect).toBeRequired();
    expect(screen.getByRole('heading', { name: 'Suggest a gig' }).parentElement).toContainElement(
      communitySelect,
    );
  });

  it('should submit the selected community when a user changes it in the header', async () => {
    await submitGigForMadrid();

    expect(createGigCandidateMock).toHaveBeenCalledWith({
      gig: { communityId: 'madrid', localityId: 'madrid-locality', title: 'Muse' },
      poster: { mode: 'url', file: null, url: '' },
    });
  });

  it('should reopen an empty gig form for the last selected community when Suggest another is clicked', async () => {
    await submitGigForMadrid('https://tickets.example/gig');

    fireEvent.click(screen.getByRole('button', { name: 'Suggest another' }));

    expect(screen.getByRole('combobox', { name: 'Community' })).toHaveTextContent('Madrid');
    expect(screen.getByLabelText('Title:*')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Add details' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByLabelText('Tickets URL:')).toHaveValue('');
  });

  it('should submit retained optional values when extra details are collapsed', async () => {
    await submitGigForMadrid('https://tickets.example/gig');

    expect(createGigCandidateMock).toHaveBeenCalledWith({
      gig: {
        communityId: 'madrid',
        localityId: 'madrid-locality',
        title: 'Muse',
        ticketsUrl: 'https://tickets.example/gig',
      },
      poster: { mode: 'url', file: null, url: '' },
    });
  });

  it('should show only the community selector when no community is selected', () => {
    renderPage();

    expect(screen.getByRole('combobox', { name: 'Choose a community' })).toBeRequired();
    expect(screen.queryByLabelText('Title:*')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit suggestion' })).not.toBeInTheDocument();
    expect(apiPublicRequestMock).not.toHaveBeenCalled();
  });

  it('should show an empty state when no communities are available', () => {
    renderPage([]);

    fireEvent.click(screen.getByRole('combobox', { name: 'Choose a community' }));

    expect(screen.getByText('No communities found.')).toBeInTheDocument();
  });

  it('should omit selection information when the full gig form is displayed', () => {
    renderPage([COMMUNITY_OPTIONS[0]], 'Choose a community to share your gig with.');

    expect(screen.queryByRole('button', { name: 'Community information' })).not.toBeInTheDocument();
  });
});
