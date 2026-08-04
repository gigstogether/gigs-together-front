import { render, screen } from '@testing-library/react';

import Header from '@/components/header/Header';

vi.mock('server-only', () => ({}));

const mockServerEnv = vi.hoisted(() => ({
  isDevelopment: false,
  isStaging: false,
}));

vi.mock('@/env/server-env', () => ({
  serverEnv: mockServerEnv,
}));

vi.mock('@/components/header/HeaderActions', () => ({
  default: () => <div data-testid="header-actions" />,
}));

describe('Header', () => {
  beforeEach(() => {
    mockServerEnv.isDevelopment = false;
    mockServerEnv.isStaging = false;
  });

  it('should render center slot children', () => {
    render(
      <Header
        country="es"
        city="barcelona"
      >
        <div data-testid="header-center-slot">Center</div>
      </Header>,
    );

    expect(screen.getByTestId('header-center-slot')).toBeInTheDocument();
    expect(screen.getByTestId('header-actions')).toBeInTheDocument();
  });

  it('should link home to feed location when country and city are provided', () => {
    render(
      <Header
        country="es"
        city="barcelona"
      />,
    );

    expect(screen.getByRole('link', { name: 'Go to home' })).toHaveAttribute(
      'href',
      '/feed/es/barcelona',
    );
  });

  it('should link home to root when location is omitted', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: 'Go to home' })).toHaveAttribute('href', '/');
  });

  it('should render environment badge in development', () => {
    mockServerEnv.isDevelopment = true;

    render(<Header />);

    expect(screen.getByAltText('DEV environment badge')).toHaveAttribute('src', '/badge-dev.svg');
  });

  it('should not render environment badge in production', () => {
    render(<Header />);

    expect(screen.queryByAltText('DEV environment badge')).not.toBeInTheDocument();
    expect(screen.queryByAltText('STG environment badge')).not.toBeInTheDocument();
  });
});
