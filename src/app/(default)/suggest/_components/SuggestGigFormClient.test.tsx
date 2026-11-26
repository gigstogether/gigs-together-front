import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import SuggestGigFormClient from './SuggestGigFormClient';
import type { SuggestCommunityOption } from '../_lib/suggest-form.shared';
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

const COMMUNITY_OPTIONS: SuggestCommunityOption[] = [
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'madrid', label: 'Madrid' },
];
const LOCALITY = {
  id: 'madrid-locality',
  countryIso: 'ES',
  name: 'Madrid',
  timeZone: 'Europe/Madrid',
};

function renderForm(communityOptions = COMMUNITY_OPTIONS) {
  return render(
    <SuggestGigFormClient
      communityOptions={communityOptions}
      countries={[{ iso: 'ES', name: 'Spain' }]}
    />,
    { wrapper: createQueryClientWrapper(createTestQueryClient()) },
  );
}

describe('SuggestGigFormClient', () => {
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
    renderForm([COMMUNITY_OPTIONS[0]]);

    const communitySelect = screen.getByRole('combobox', { name: 'Community' });

    expect(communitySelect).toHaveTextContent('Barcelona');
    expect(communitySelect).toHaveAccessibleDescription('Change community');
    expect(communitySelect).toBeRequired();
    expect(screen.getByRole('heading', { name: 'Suggest a gig' }).parentElement).toContainElement(
      communitySelect,
    );
  });

  it('should submit the selected community when a user changes it in the header', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Title:*'), { target: { value: 'Muse' } });
    fireEvent.click(screen.getByRole('combobox', { name: 'Community' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search communities' }), {
      target: { value: 'Madrid' },
    });
    fireEvent.click(screen.getByRole('option', { name: 'Madrid' }));
    const localitySelect = screen.getByRole('combobox', { name: 'Locality:' });
    await waitFor(() => expect(localitySelect).toBeEnabled());
    fireEvent.click(localitySelect);
    fireEvent.click(screen.getByRole('option', { name: 'Madrid' }));

    fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));

    await waitFor(() =>
      expect(createGigCandidateMock).toHaveBeenCalledWith({
        gig: { communityId: 'madrid', localityId: 'madrid-locality', title: 'Muse' },
        poster: { mode: 'url', file: null, url: '' },
      }),
    );
  });

  it('should show a validation error when no community is selected', async () => {
    renderForm();

    fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));

    expect(await screen.findByText('Community is required.')).toHaveAttribute('role', 'alert');
  });
});
