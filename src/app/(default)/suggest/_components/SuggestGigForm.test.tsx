// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import SuggestGigForm from './SuggestGigForm';
import { createQueryClientWrapper, createTestQueryClient } from '@/test/react-query-client';
import { stubResizeObserver } from '@/test/moderator-telegram-session-mock';

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

const COMMUNITY_OPTIONS = [
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'madrid', label: 'Madrid' },
];

function renderForm() {
  return render(
    <SuggestGigForm
      initialCommunityId="barcelona"
      communityOptions={COMMUNITY_OPTIONS}
      countries={[
        { iso: 'ES', name: 'Spain' },
        { iso: 'FR', name: 'France' },
      ]}
    />,
    { wrapper: createQueryClientWrapper(createTestQueryClient()) },
  );
}

async function fillRequiredFields(): Promise<void> {
  fireEvent.change(screen.getByLabelText('Title:*'), { target: { value: 'Muse' } });
  const localitySelect = screen.getByRole('combobox', { name: 'City / area:' });
  await waitFor(() => expect(localitySelect).toHaveTextContent('Barcelona (Catalonia)'));
}

async function selectFirstVenue(): Promise<void> {
  await fillRequiredFields();
  fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
  const venueSelect = screen.getByRole('combobox', { name: 'Venue:' });
  await waitFor(() => expect(venueSelect).toBeEnabled());
  fireEvent.click(venueSelect);
  fireEvent.click(screen.getByRole('option', { name: 'Razzmatazz' }));
}

describe('SuggestGigForm', () => {
  beforeEach(() => {
    stubResizeObserver();
    createGigCandidateMock.mockReset().mockResolvedValue({ id: 'candidate-id' });
    apiPublicRequestMock.mockReset();
    apiPublicRequestMock.mockImplementation((endpoint: string) => {
      if (endpoint === '/v1/localities?countryIso=FR') {
        return Promise.resolve({ localities: [] });
      }
      if (endpoint === '/v1/localities?countryIso=ES') {
        return Promise.resolve({
          localities: [
            {
              id: 'locality-id',
              countryIso: 'ES',
              name: 'Barcelona',
              qualifier: 'Catalonia',
              timeZone: 'Europe/Madrid',
            },
          ],
        });
      }

      return Promise.resolve({
        locality: {
          id: 'locality-id',
          countryIso: 'ES',
          name: 'Barcelona',
          qualifier: 'Catalonia',
          timeZone: 'Europe/Madrid',
        },
        venues: [
          { id: 'venue-id-1', name: 'Razzmatazz' },
          { id: 'venue-id-2', name: 'Sala Apolo' },
        ],
      });
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize the community when an initial ID is provided', () => {
    render(
      <SuggestGigForm
        initialCommunityId="madrid"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
      { wrapper: createQueryClientWrapper(createTestQueryClient()) },
    );

    expect(screen.getByRole('combobox', { name: 'Community' })).toHaveTextContent('Madrid');
  });

  it('should preserve entered gig fields when the community changes in the header', () => {
    render(
      <SuggestGigForm
        initialCommunityId="barcelona"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
      { wrapper: createQueryClientWrapper(createTestQueryClient()) },
    );
    fireEvent.change(screen.getByLabelText('Title:*'), { target: { value: 'Muse' } });

    fireEvent.click(screen.getByRole('combobox', { name: 'Community' }));
    fireEvent.click(screen.getByRole('option', { name: 'Madrid' }));

    expect(screen.getByRole('combobox', { name: 'Community' })).toHaveTextContent('Madrid');
    expect(screen.getByLabelText('Title:*')).toHaveValue('Muse');
  });

  it('should preserve form state when the initial community prop changes after mounting', () => {
    const { rerender } = render(
      <SuggestGigForm
        initialCommunityId="barcelona"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
      { wrapper: createQueryClientWrapper(createTestQueryClient()) },
    );
    fireEvent.change(screen.getByLabelText('Title:*'), { target: { value: 'Muse' } });

    rerender(
      <SuggestGigForm
        initialCommunityId="madrid"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Community' })).toHaveTextContent('Barcelona');
    expect(screen.getByLabelText('Title:*')).toHaveValue('Muse');
  });

  it('should reveal optional errors when a collapsed optional field is invalid', async () => {
    render(
      <SuggestGigForm
        initialCommunityId="barcelona"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
      { wrapper: createQueryClientWrapper(createTestQueryClient()) },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.change(screen.getByLabelText('Tickets URL:'), { target: { value: 'invalid-url' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hide details' }));

    fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));

    expect(await screen.findByText('Please enter a valid ticket URL.')).toBeVisible();
  });

  it('should reveal the poster field when extra gig details are expanded', () => {
    render(
      <SuggestGigForm
        initialCommunityId="barcelona"
        communityOptions={COMMUNITY_OPTIONS}
        countries={[]}
      />,
      { wrapper: createQueryClientWrapper(createTestQueryClient()) },
    );
    expect(screen.getByText('Poster:')).not.toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByText('Poster:')).toBeVisible();
  });

  it('should display the resolved country name', () => {
    renderForm();

    expect(screen.getByRole('combobox', { name: 'Country:' })).toHaveTextContent('Spain');
  });

  it('should search and select a country', () => {
    renderForm();

    const countrySelect = screen.getByRole('combobox', { name: 'Country:' });

    fireEvent.click(countrySelect);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search countries' }), {
      target: { value: 'France' },
    });

    expect(screen.queryByRole('option', { name: 'Spain' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'France' }));

    expect(countrySelect).toHaveTextContent('France');
  });

  it('should limit the title input to 300 characters', () => {
    renderForm();

    expect(screen.getByLabelText('Title:*')).toHaveAttribute('maxlength', '300');
  });

  it('should mark required fields', () => {
    renderForm();

    expect(screen.getByLabelText('Title:*')).toBeRequired();
    expect(screen.getByLabelText('Country:*')).toBeRequired();
    expect(screen.getByRole('combobox', { name: 'City / area:' })).toBeRequired();

    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByLabelText('Date:')).not.toBeRequired();
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
    expect(screen.getByLabelText('End Date:')).not.toBeRequired();
    expect(screen.getByLabelText('Venue:')).not.toBeRequired();
    expect(screen.getByLabelText('Tickets URL:')).not.toBeRequired();
  });

  it('should align date fields horizontally on all screen sizes when multiple days are enabled', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));

    const dateInput = screen.getByLabelText('Date:');
    const dateField = dateInput.closest('[data-slot="field"]');
    const endDateField = screen.getByLabelText('End Date:').closest('[data-slot="field"]');

    expect(dateField?.parentElement).toBe(endDateField?.parentElement);
    expect(dateField?.parentElement).toHaveClass('grid-cols-2');
    expect(dateInput.closest('[data-slot="date-input-frame"]')).toHaveClass(
      'h-9',
      'max-w-full',
      'overflow-hidden',
    );
  });

  it('should hide optional inputs when the form first opens', () => {
    renderForm();

    expect(screen.getByLabelText('Tickets URL:')).not.toBeVisible();
    expect(screen.getByLabelText('Date:')).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Add details' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('should preserve optional values when extra details are collapsed and reopened', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.change(screen.getByLabelText('Tickets URL:'), {
      target: { value: 'https://tickets.example/gig' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Hide details' }));
    expect(screen.getByLabelText('Tickets URL:')).not.toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByLabelText('Tickets URL:')).toHaveValue('https://tickets.example/gig');
  });

  it('should show the Locality qualifier and enable only matching Venues', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    const localitySelect = screen.getByRole('combobox', { name: 'City / area:' });
    await waitFor(() => expect(localitySelect).toHaveTextContent('Barcelona (Catalonia)'));

    expect(apiPublicRequestMock).toHaveBeenCalledWith('/v1/venues?localityId=locality-id', 'GET');
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Venue:' })).toBeEnabled());

    fireEvent.click(screen.getByRole('combobox', { name: 'Venue:' }));
    fireEvent.click(screen.getByRole('option', { name: 'Razzmatazz' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add another venue' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Venue 2' }));
    expect(screen.queryByRole('option', { name: 'Razzmatazz' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'Sala Apolo' }));

    expect(screen.getByRole('combobox', { name: 'Venue:' })).toHaveTextContent('Razzmatazz');
    expect(screen.getByRole('combobox', { name: 'Venue 2' })).toHaveTextContent('Sala Apolo');
    expect(screen.queryByRole('button', { name: 'Add another venue' })).not.toBeInTheDocument();
  });

  it('should show only one date input when additional details are opened', () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByLabelText('Date:')).toBeVisible();
    expect(screen.queryByLabelText('End Date:')).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Multi-day event' })).not.toBeChecked();
  });

  it('should preserve both dates when additional details are collapsed and reopened', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('End Date:'), { target: { value: '2026-08-03' } });

    fireEvent.click(screen.getByRole('button', { name: 'Hide details' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByLabelText('Date:')).toHaveValue('2026-08-01');
    expect(screen.getByLabelText('End Date:')).toHaveValue('2026-08-03');
    expect(screen.getByRole('switch', { name: 'Multi-day event' })).toBeChecked();
  });

  it('should clear the dependent date error when multiple days are disabled', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
    fireEvent.change(screen.getByLabelText('End Date:'), { target: { value: '2026-08-03' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));
    expect(await screen.findByText('Date is required when End Date is provided.')).toBeVisible();

    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));

    await waitFor(() =>
      expect(
        screen.queryByText('Date is required when End Date is provided.'),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByLabelText('End Date:')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
    expect(screen.getByLabelText('End Date:')).toHaveValue('');
  });

  it.each([false, true])(
    'should submit the expected date range when multiple days are %s',
    async (isEndDateEnabled) => {
      renderForm();
      await fillRequiredFields();
      fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
      fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
      fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2026-08-01' } });
      fireEvent.change(screen.getByLabelText('End Date:'), { target: { value: '2026-08-03' } });
      if (!isEndDateEnabled) {
        fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
      }

      fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));
      await screen.findByText('Suggestion received');

      const gig = {
        communityId: 'barcelona',
        localityId: 'locality-id',
        title: 'Muse',
        date: '2026-08-01',
      };
      const expectedGig = isEndDateEnabled ? { ...gig, endDate: '2026-08-03' } : gig;
      expect(createGigCandidateMock).toHaveBeenCalledWith({
        gig: expectedGig,
        poster: { mode: 'url', file: null, url: '' },
      });
    },
  );

  it('should disable the end date when another suggestion is started after a successful submission', async () => {
    renderForm();
    await fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Multi-day event' }));
    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('End Date:'), { target: { value: '2026-08-03' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));
    await screen.findByText('Suggestion received');

    fireEvent.click(screen.getByRole('button', { name: 'Suggest another' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByRole('switch', { name: 'Multi-day event' })).not.toBeChecked();
    expect(screen.getByLabelText('Date:')).toHaveValue('');
    expect(screen.queryByLabelText('End Date:')).not.toBeInTheDocument();
  });

  it('should show one venue selector when additional details are opened', () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByRole('combobox', { name: 'Venue:' })).toBeVisible();
    expect(screen.queryByRole('combobox', { name: 'Venue 2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add another venue' })).not.toBeInTheDocument();
  });

  it('should submit only selected venues when an additional selector is left empty', async () => {
    renderForm();
    await selectFirstVenue();
    fireEvent.click(screen.getByRole('button', { name: 'Add another venue' }));
    expect(screen.getByRole('combobox', { name: 'Venue 2' })).toHaveTextContent('Select a venue');

    fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));
    await screen.findByText('Suggestion received');

    expect(createGigCandidateMock).toHaveBeenCalledWith({
      gig: {
        communityId: 'barcelona',
        localityId: 'locality-id',
        title: 'Muse',
        venueIds: ['venue-id-1'],
      },
      poster: { mode: 'url', file: null, url: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Suggest another' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));
    expect(screen.queryByRole('combobox', { name: 'Venue 2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove venue 1' })).not.toBeInTheDocument();
  });

  it('should submit the remaining venue when the first selected venue is removed', async () => {
    renderForm();
    await selectFirstVenue();
    fireEvent.click(screen.getByRole('button', { name: 'Add another venue' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Venue 2' }));
    fireEvent.click(screen.getByRole('option', { name: 'Sala Apolo' }));

    fireEvent.click(screen.getByRole('button', { name: 'Remove venue 1' }));
    fireEvent.submit(screen.getByRole('form', { name: 'Suggest a gig' }));
    await screen.findByText('Suggestion received');

    expect(createGigCandidateMock).toHaveBeenCalledWith({
      gig: {
        communityId: 'barcelona',
        localityId: 'locality-id',
        title: 'Muse',
        venueIds: ['venue-id-2'],
      },
      poster: { mode: 'url', file: null, url: '' },
    });
  });

  it('should dismiss an empty additional venue selector when its remove button is clicked', async () => {
    renderForm();
    await selectFirstVenue();
    fireEvent.click(screen.getByRole('button', { name: 'Add another venue' }));

    fireEvent.click(screen.getByRole('button', { name: 'Remove venue 2' }));

    expect(screen.queryByRole('combobox', { name: 'Venue 2' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Venue:' })).toHaveTextContent('Razzmatazz');
    expect(screen.getByRole('button', { name: 'Add another venue' })).toBeVisible();
  });

  it('should clear venue selections and the additional selector when the country changes', async () => {
    renderForm();
    await selectFirstVenue();
    fireEvent.click(screen.getByRole('button', { name: 'Add another venue' }));

    fireEvent.click(screen.getByRole('combobox', { name: 'Country:' }));
    fireEvent.click(screen.getByRole('option', { name: 'France' }));

    expect(screen.queryByRole('combobox', { name: 'Venue 2' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Venue:' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Remove venue 1' })).not.toBeInTheDocument();
  });

  it('should retain selected venues when additional details are collapsed and reopened', async () => {
    renderForm();
    await selectFirstVenue();
    fireEvent.click(screen.getByRole('button', { name: 'Add another venue' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Venue 2' }));
    fireEvent.click(screen.getByRole('option', { name: 'Sala Apolo' }));

    fireEvent.click(screen.getByRole('button', { name: 'Hide details' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }));

    expect(screen.getByRole('combobox', { name: 'Venue:' })).toHaveTextContent('Razzmatazz');
    expect(screen.getByRole('combobox', { name: 'Venue 2' })).toHaveTextContent('Sala Apolo');
  });

  it('should select the only locality when its catalog finishes loading', async () => {
    renderForm();

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'City / area:' })).toHaveTextContent(
        'Barcelona (Catalonia)',
      ),
    );
  });

  it.each([
    { condition: 'no choices', localities: [] },
    {
      condition: 'multiple choices',
      localities: [
        { id: 'barcelona', countryIso: 'ES', name: 'Barcelona', timeZone: 'Europe/Madrid' },
        { id: 'madrid', countryIso: 'ES', name: 'Madrid', timeZone: 'Europe/Madrid' },
      ],
    },
  ])(
    'should leave the locality unselected when its catalog has $condition',
    async ({ localities }) => {
      apiPublicRequestMock.mockResolvedValueOnce({ localities });
      renderForm();
      const localitySelect = screen.getByRole('combobox', { name: 'City / area:' });

      await waitFor(() => expect(localitySelect).toBeEnabled());

      expect(localitySelect).toHaveTextContent('Select a city or area');
    },
  );

  it('should leave the locality unselected when its catalog fails to load', async () => {
    apiPublicRequestMock.mockRejectedValueOnce(new Error('Locality catalog unavailable'));
    renderForm();

    await screen.findByText('Could not load cities and areas.');

    expect(screen.getByRole('combobox', { name: 'City / area:' })).toHaveTextContent(
      'Select a city or area',
    );
  });

  it('should select the only locality in the new country when the country changes', async () => {
    renderForm();
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'City / area:' })).toHaveTextContent('Barcelona'),
    );
    apiPublicRequestMock.mockResolvedValueOnce({
      localities: [{ id: 'lyon', countryIso: 'FR', name: 'Lyon', timeZone: 'Europe/Paris' }],
    });

    fireEvent.click(screen.getByRole('combobox', { name: 'Country:' }));
    fireEvent.click(screen.getByRole('option', { name: 'France' }));

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'City / area:' })).toHaveTextContent('Lyon'),
    );
  });

  it('should select the cached sole locality when returning to a country', async () => {
    renderForm();
    const localitySelect = screen.getByRole('combobox', { name: 'City / area:' });
    await waitFor(() => expect(localitySelect).toHaveTextContent('Barcelona'));
    fireEvent.click(screen.getByRole('combobox', { name: 'Country:' }));
    fireEvent.click(screen.getByRole('option', { name: 'France' }));
    await waitFor(() => expect(localitySelect).toBeEnabled());
    expect(localitySelect).toHaveTextContent('Select a city or area');

    fireEvent.click(screen.getByRole('combobox', { name: 'Country:' }));
    fireEvent.click(screen.getByRole('option', { name: 'Spain' }));

    await waitFor(() => expect(localitySelect).toHaveTextContent('Barcelona'));
  });
});
