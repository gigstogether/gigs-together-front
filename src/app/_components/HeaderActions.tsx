'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FaBars, FaGithub, FaRegLightbulb, FaTelegramPlane } from 'react-icons/fa';
import HeaderAuthActions from '@/app/_components/HeaderAuthActions';
import HeaderSignInModal from '@/app/_components/HeaderSignInModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationIcon } from '@/components/ui/location-icon';
import { clientEnv } from '@/env/client-env';
import { useTelegramMiniAppEnv } from '@/hooks/use-telegram-mini-app-env';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { normalizeLocationTitle } from '@/lib/utils';

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
  readonly country: string;
  readonly city: string;
  readonly showSuggestGig?: boolean;
}

export default function HeaderActions(props: HeaderActionsProps) {
  const { country, city, showSuggestGig = true } = props;

  const locationLabel = city ? normalizeLocationTitle(city) : country.toUpperCase();
  const telegramUrl = clientEnv.telegramUrl;
  const githubUrl = clientEnv.githubUrl;
  const suggestGigUrl = showSuggestGig ? clientEnv.suggestGigLink : undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [locationTipOpen, setLocationTipOpen] = useState(false);
  const { authState, isLoadingAuthState } = useTelegramAuth();
  const miniAppEnv = useTelegramMiniAppEnv();
  const telegramBotUsername = clientEnv.isAuthEnabled ? clientEnv.telegramBotUsername : undefined;
  const isSignInShownInMenu =
    !isLoadingAuthState && Boolean(telegramBotUsername?.trim()) && miniAppEnv === 'browser';

  /** Profile / Sign in / loading row — aligned with HeaderAuthActions. */
  const hasAuthPrimaryRow = isLoadingAuthState || Boolean(authState) || isSignInShownInMenu;

  /** Desktop burger menu rows between auth header and About (excluding the About divider slot). */
  const hasMiddleRowsBeforeAboutDesktop = Boolean(authState?.isAdmin);

  const showDividerAfterAuthDesktop = hasAuthPrimaryRow && hasMiddleRowsBeforeAboutDesktop;
  /** Mobile menu always stacks Location links above About — separate account header from navigator. */
  const showDividerAfterAuthMobile = hasAuthPrimaryRow;

  /** Desktop: About separated when the menu shows account UX (not Telegram-only About row). */
  const showDividerBeforeAboutDesktop = hasAuthPrimaryRow;

  return (
    <div className="min-w-0 justify-self-end flex items-center space-x-4">
      {/* Desktop actions */}
      <div className="hidden sm:flex items-center space-x-4">
        <Popover
          open={locationTipOpen}
          onOpenChange={setLocationTipOpen}
        >
          <PopoverTrigger
            type="button"
            className="flex items-center gap-2 text-base font-normal text-gray-800"
            aria-label="Current location"
            title="Location"
          >
            <LocationIcon className="h-4 w-4" />
            {locationLabel}
          </PopoverTrigger>
          <PopoverContent
            className="w-auto px-3 py-2 text-sm"
            align="end"
            side="bottom"
          >
            Currently, we only support one location: Barcelona.
          </PopoverContent>
        </Popover>

        {!!suggestGigUrl && (
          <a
            href={suggestGigUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-black px-2 py-1.5 text-sm font-medium text-white hover:bg-black/90 whitespace-nowrap lg:px-3"
            aria-label="Suggest a gig"
            title="Suggest a gig"
          >
            <span className="hidden lg:inline">Suggest a gig</span>
            <FaRegLightbulb
              className="text-[1.05em] lg:hidden"
              aria-hidden
            />
          </a>
        )}

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
                <a
                  href="/admin"
                  className={headerMenuNavItemClass}
                  onClick={() => setDesktopMenuOpen(false)}
                >
                  <SlidersHorizontal
                    className="h-4 w-4 shrink-0"
                    aria-hidden
                  />
                  Admin panel
                </a>
              ) : null}
              {showDividerBeforeAboutDesktop ? <HeaderMenuDivider /> : null}
              <a
                href="/about"
                className={headerMenuNavItemClass}
                onClick={() => setDesktopMenuOpen(false)}
              >
                About
              </a>
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

              {!!suggestGigUrl && (
                <>
                  <a
                    href={suggestGigUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={headerMenuNavItemClass}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Suggest a gig"
                  >
                    <FaRegLightbulb className="h-4 w-4" />
                    Suggest a gig
                  </a>
                </>
              )}

              <Popover>
                <PopoverTrigger
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-gray-800 hover:bg-muted"
                  aria-label="Current location"
                >
                  <LocationIcon className="h-4 w-4" />
                  {locationLabel}
                </PopoverTrigger>
                <PopoverContent
                  className="w-64 px-3 py-2 text-sm"
                  align="start"
                  side="bottom"
                >
                  Currently, we only support one location: Barcelona.
                </PopoverContent>
              </Popover>

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
                <a
                  href="/admin"
                  className={headerMenuNavItemClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <SlidersHorizontal
                    className="h-4 w-4 shrink-0"
                    aria-hidden
                  />
                  Admin panel
                </a>
              ) : null}

              <HeaderMenuDivider />
              <a
                href="/about"
                className={headerMenuNavItemClass}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="About"
              >
                About
              </a>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <HeaderSignInModal />
    </div>
  );
}
