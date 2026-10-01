import { render, screen } from '@testing-library/react';

import NotFound from './not-found';

vi.mock('@/components/header/Header', () => ({
  default: () => <header>Gigs Together!</header>,
}));

describe('NotFound', () => {
  it('should render navigation and a link to the home page', () => {
    render(<NotFound />);

    expect(screen.getByRole('banner')).toHaveTextContent('Gigs Together!');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to home page' })).toHaveAttribute('href', '/');
  });
});
