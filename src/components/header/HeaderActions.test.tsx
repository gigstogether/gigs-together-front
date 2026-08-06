import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import HeaderActions from '@/components/header/HeaderActions';

const { mockClientEnv } = vi.hoisted(() => ({
  mockClientEnv: {
    telegramUrl: undefined,
    githubUrl: undefined,
    isPublicSuggestGigEnabled: false,
    telegramBotUsername: 'bot',
    isAuthEnabled: true,
  },
}));

vi.mock('@/components/header/HeaderSignInModal', () => ({
  default: () => null,
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
  useTelegramMiniAppEnv: () => 'browser' as const,
}));

import { useTelegramAuth } from '@/hooks/use-telegram-auth';

describe('HeaderActions', () => {
  beforeEach(() => {
    mockClientEnv.isAuthEnabled = true;
    mockClientEnv.isPublicSuggestGigEnabled = false;
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: null,
      isLoadingAuthState: false,
      hasTelegramMiniAppAuthError: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
  });

  function clickFirstMenuTrigger(): void {
    fireEvent.click(screen.getAllByRole('button', { name: 'Menu' })[0]!);
  }

  it('should show Admin panel in menu below auth when user is admin', async () => {
    vi.mocked(useTelegramAuth).mockReturnValue({
      authState: { displayLabel: '@admin', isAdmin: true },
      isLoadingAuthState: false,
      hasTelegramMiniAppAuthError: false,
      signIn: vi.fn(),
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
      signIn: vi.fn(),
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
      signIn: vi.fn(),
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
      '/admin/gigs/new',
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
