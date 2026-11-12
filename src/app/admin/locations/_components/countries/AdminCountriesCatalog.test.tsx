import { render, screen } from '@testing-library/react';

import AdminCountriesCatalog from './AdminCountriesCatalog';

describe('AdminCountriesCatalog', () => {
  it('should render only configured countries in the catalog', () => {
    render(
      <AdminCountriesCatalog
        countries={[{ iso: 'ES' }]}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('ES')).toBeInTheDocument();
    expect(screen.getByText('Spain')).toBeInTheDocument();
  });

  it('should show an error when configured countries cannot be loaded', () => {
    render(
      <AdminCountriesCatalog
        countries={[]}
        isLoading={false}
        isError
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('Could not load configured countries.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
  });
});
