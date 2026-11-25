import { render, screen } from '@testing-library/react';

import { VenueMapLinks } from '@/components/VenueMapLinks';

describe('VenueMapLinks', () => {
  it('should render a separate map link for every Venue', () => {
    render(
      <VenueMapLinks
        venues={[
          { id: 'venue-1', name: 'Auditori Fòrum CCIB' },
          { id: 'venue-2', name: 'Bar Ceferino' },
        ]}
        locality={{
          countryIso: 'ES',
          name: 'Barcelona',
        }}
        locale="en"
      />,
    );

    expect(
      screen.getByRole('link', { name: 'Open Auditori Fòrum CCIB in Google Maps' }),
    ).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=Auditori%20F%C3%B2rum%20CCIB%20Barcelona%20Spain',
    );
    expect(screen.getByRole('link', { name: 'Open Bar Ceferino in Google Maps' })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=Bar%20Ceferino%20Barcelona%20Spain',
    );
    expect(screen.queryByText(/Barcelona, Spain/)).not.toBeInTheDocument();
  });
});
