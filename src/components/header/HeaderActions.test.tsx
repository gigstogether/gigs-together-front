import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import HeaderActions from '@/components/header/HeaderActions';

const { mockClientEnv, miniAppEnvMock } = vi.hoisted(() => ({
  mockClientEnv: {
    telegramUrl: undefined,
    githubUrl: undefined,
    isPublicSuggestGigEnabled: false,
    telegramOidcClientId: 123456,
    isAuthEnabled: true,
  },
  miniAppEnvMock: vi.fn<() => 'browser' | 'mini' | 'unknown'>(),
}));

vi.mock('@/components/header/HeaderSignInModal', () => ({
  default: () => <div data-testid="header-sign-in-modal" />,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  } & Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'href'>) => (
    <a
      data-next-link="true"
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock('@/env/client-env', () => ({
  clientEnv: mockClientEnv,
}));

vi.mock('@/hooks/use-telegram-auth', () => ({
  useTelegramAuth: vi.fn(),
}));

vi.mock('@/hooks/use-telegram-mini-app-env', () => ({
  useTelegramMiniAppEnv: miniAppEnvMock,
}));

import { useTelegramAuth } from '@/hooks/use-telegram-auth';

describe('HeaderActions', () => {
  beforeEach(() => {
    mockClientEnv.isAuthEnabled = true;
    mockClientEnv.isPublicSuggestGigEnabled = false;
    miniAppEnvMock.mockReset();
    miniAppEnvMock.mockReturnValue('browser');
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      hasTelegramMiniAppAuthError: false,
      signOut: vi.fn(),
    });
  });

  function clickFirstMenuTrigger(): void {
    fireEvent.click(screen.getAllByRole('button', { name: 'Menu' })[0]!);
  }

  it('should load sign-in modal in a regular browser', async () => {
    render(<HeaderActions />);

    expect(await screen.findByTestId('header-sign-in-modal')).toBeInTheDocument();
  });

  it('should not load sign-in modal in Telegram Mini App', () => {
    miniAppEnvMock.mockReturnValue('mini');

    render(<HeaderActions />);

    expect(screen.queryByTestId('header-sign-in-modal')).not.toBeInTheDocument();
  });

  it('should show Admin panel in menu below auth when user is admin', async () => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: { displayLabel: '@admin', isAdmin: true },
      isLoadingAuthState: false,
      hasTelegramMiniAppAuthError: false,
      signOut: vi.fn(),
    });

    render(
      <HeaderActions
        country="es"
        city="barcelona"
      />,
    );

    clickFirstMenuTrigger();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Admin panel' })).toHaveAttribute('href', '/admin');
      expect(screen.getByRole('link', { name: 'Admin panel' })).toHaveAttribute(
        'data-next-link',
        'true',
      );
      expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('data-next-link', 'true');
    });
  });

  it('should omit Admin panel in menu when user is not admin', async () => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: { displayLabel: '@only', isAdmin: false },
      isLoadingAuthState: false,
      hasTelegramMiniAppAuthError: false,
      signOut: vi.fn(),
    });

    render(
      <HeaderActions
        country="es"
        city="barcelona"
      />,
    );

    clickFirstMenuTrigger();

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Admin panel' })).toBeNull();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });
  });

  it('should hide Sign in in menu when auth is disabled for guests', async () => {
    mockClientEnv.isAuthEnabled = false;

    render(
      <HeaderActions
        country="es"
        city="barcelona"
      />,
    );

    clickFirstMenuTrigger();

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });
  });

  it('should show suggest gig for admins when public suggest gig is disabled', () => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: { displayLabel: '@admin', isAdmin: true },
      isLoadingAuthState: false,
      hasTelegramMiniAppAuthError: false,
      signOut: vi.fn(),
    });

    render(
      <HeaderActions
        country="es"
        city="barcelona"
      />,
    );

    expect(screen.getByRole('link', { name: 'Suggest a gig' })).toHaveAttribute(
      'href',
      '/admin/gig-candidates/new',
    );
  });

  it('should hide suggest gig for guests when public suggest gig is disabled', () => {
    render(
      <HeaderActions
        country="es"
        city="barcelona"
      />,
    );

    expect(screen.queryByRole('link', { name: 'Suggest a gig' })).toBeNull();
  });

  it('should show suggest route for guests when public suggest gig is enabled', () => {
    mockClientEnv.isPublicSuggestGigEnabled = true;

    render(
      <HeaderActions
        country="es"
        city="barcelona"
      />,
    );

    expect(screen.getByRole('link', { name: 'Suggest a gig' })).toHaveAttribute('href', '/suggest');
  });
});
