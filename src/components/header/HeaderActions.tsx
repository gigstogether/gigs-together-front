'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FaBars, FaGithub, FaRegLightbulb, FaTelegramPlane } from 'react-icons/fa';
import HeaderAuthActions from '@/components/header/HeaderAuthActions';
import HeaderSignInModal from '@/components/header/HeaderSignInModal';
import { ADMIN_GIGS_NEW_ROUTE } from '@/lib/admin-gig-paths';
import { SUGGEST_ROUTE } from '@/lib/suggest-paths';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { clientEnv } from '@/env/client-env';
import { useTelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { normalizeLocationTitle } from '@/lib/utils';
import LocationPopover from '@/components/header/LocationPopover';

function HeaderMenuDivider() {
  return (
    <div
      className="my-0.5 h-px w-full bg-border/40"
      aria-hidden
    />
  );
}

const headerMenuNavItemClass =
  'flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted';

export interface HeaderActionsProps {
  readonly country?: string;
  readonly city?: string;
}

const adminHref: Route = '/admin';
const aboutHref: Route = '/about';

export default function HeaderActions(props: HeaderActionsProps) {
  const { country, city } = props;

  const location = country
    ? city
      ? normalizeLocationTitle(city)
      : country.toUpperCase()
    : undefined;
  const telegramUrl = clientEnv.telegramUrl;
  const githubUrl = clientEnv.githubUrl;
  const isAuthEnabled = clientEnv.isAuthEnabled;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

  const { authState } = useTelegramAuth();
  const miniAppEnv = useTelegramMiniAppEnv();

  const telegramBotUsername = clientEnv.telegramBotUsername;
  const isAdmin = authState?.isAdmin === true;
  const suggestGigHref = isAdmin
    ? ADMIN_GIGS_NEW_ROUTE
    : clientEnv.isPublicSuggestGigEnabled
      ? SUGGEST_ROUTE
      : undefined;
  const isSignInShownInMenu =
    isAuthEnabled && Boolean(telegramBotUsername?.trim()) && miniAppEnv === 'browser';
  const hasVisibleAuthState = Boolean(authState);

  /** Profile / Sign in row is visible — same predicates as HeaderAuthActions non-empty UX. */
  const hasAuthPrimaryRow = hasVisibleAuthState || isSignInShownInMenu;

  /** Desktop burger menu rows between auth header and About (excluding the About divider slot). */
  const hasMiddleRowsBeforeAboutDesktop = authState?.isAdmin === true;

  const showDividerAfterAuthDesktop = hasAuthPrimaryRow && hasMiddleRowsBeforeAboutDesktop;
  /** Mobile menu always stacks Location links above About — separate account header from navigator. */
  const showDividerAfterAuthMobile = hasAuthPrimaryRow;

  /** Desktop: About separated when the menu shows account UX (not Telegram-only About row). */
  const showDividerBeforeAboutDesktop = hasVisibleAuthState || isSignInShownInMenu;

  return (
    <div className="min-w-0 justify-self-end flex items-center space-x-4">
      <div className="hidden sm:block">
        <LocationPopover location={location} />
      </div>

      {!!suggestGigHref && (
        <Link
          href={suggestGigHref}
          className="inline-flex items-center justify-center rounded-md bg-black px-2 py-1.5 text-sm font-medium text-white hover:bg-black/90 whitespace-nowrap lg:px-3"
          aria-label="Suggest a gig"
          title="Suggest a gig"
        >
          <span className="hidden lg:inline">Suggest a gig</span>
          <FaRegLightbulb
            className="text-[1.05em] lg:hidden"
            aria-hidden
          />
        </Link>
      )}

      {/* Desktop actions */}
      <div className="hidden sm:flex items-center space-x-4">
        {!!telegramUrl && (
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
          >
            <FaTelegramPlane className="text-xl text-black-500 hover:text-black-700" />
          </a>
        )}

        {!!githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <FaGithub className="text-xl text-black-500 hover:text-black-700" />
          </a>
        )}

        <Popover
          open={desktopMenuOpen}
          onOpenChange={setDesktopMenuOpen}
        >
          <PopoverTrigger
            type="button"
            aria-label="Menu"
            className="py-1.5 px-0"
          >
            <FaBars className="text-base text-black-500 hover:text-black-700" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-auto min-w-[13rem] max-w-[min(100vw-2rem,20rem)] p-2"
          >
            <div className="flex flex-col gap-1">
              <HeaderAuthActions />
              {showDividerAfterAuthDesktop ? <HeaderMenuDivider /> : null}
              {authState?.isAdmin ? (
                <Link
                  href={adminHref}
                  className={headerMenuNavItemClass}
                  onClick={() => setDesktopMenuOpen(false)}
                >
                  <SlidersHorizontal
                    className="h-4 w-4 shrink-0"
                    aria-hidden
                  />
                  Admin panel
                </Link>
              ) : null}
              {showDividerBeforeAboutDesktop ? <HeaderMenuDivider /> : null}
              <Link
                href={aboutHref}
                className={headerMenuNavItemClass}
                onClick={() => setDesktopMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <Popover
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
        >
          <PopoverTrigger
            type="button"
            aria-label="Menu"
            className="py-1.5 px-0"
          >
            <FaBars className="text-base text-black-500 hover:text-black-700" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-auto min-w-[14rem] max-w-[min(100vw-2rem,20rem)] p-2"
          >
            <div className="flex flex-col gap-1">
              <HeaderAuthActions />
              {showDividerAfterAuthMobile ? <HeaderMenuDivider /> : null}

              <LocationPopover
                location={location}
                cn="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
              />

              {!!telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={headerMenuNavItemClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaTelegramPlane className="text-lg" />
                  Telegram
                </a>
              )}

              {!!githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={headerMenuNavItemClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaGithub className="h-4 w-4" />
                  GitHub
                </a>
              )}

              {authState?.isAdmin ? (
                <Link
                  href={adminHref}
                  className={headerMenuNavItemClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <SlidersHorizontal
                    className="h-4 w-4 shrink-0"
                    aria-hidden
                  />
                  Admin panel
                </Link>
              ) : null}

              <HeaderMenuDivider />
              <Link
                href={aboutHref}
                className={headerMenuNavItemClass}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="About"
              >
                About
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <HeaderSignInModal />
    </div>
  );
}
