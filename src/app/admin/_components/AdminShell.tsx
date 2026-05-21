'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import AdminNav from '@/app/admin/_components/AdminNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useModeratorTelegramSession } from '@/hooks/use-moderator-telegram-session';

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const { authState, miniAppEnv, handleSignOut } = useModeratorTelegramSession();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const [asideHeight, setAsideHeight] = useState(0);

  useLayoutEffect(() => {
    const asideElement = asideRef.current;
    if (!asideElement) {
      return;
    }

    const updateHeight = () => {
      setAsideHeight(asideElement.getBoundingClientRect().height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(asideElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [authState?.displayLabel, isNavCollapsed, miniAppEnv]);

  const handleToggleNav = () => {
    setIsNavCollapsed((previous) => !previous);
  };

  const handleNavigate = () => {
    setIsNavCollapsed(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8">
      <div className="w-full shrink-0 lg:w-56">
        <aside
          ref={asideRef}
          className={cn(
            'fixed z-40 top-[calc(var(--header-h)+1.5rem)] left-4 right-4',
            'lg:left-[calc((100vw-min(100vw,72rem))/2+1rem)] lg:right-auto lg:w-56',
          )}
        >
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {authState?.displayLabel ? (
                  <p className="mt-1 truncate text-sm font-medium text-foreground">
                    {authState.displayLabel}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 lg:hidden"
                aria-expanded={!isNavCollapsed}
                aria-controls="admin-nav"
                onClick={handleToggleNav}
              >
                {isNavCollapsed ? <ChevronDown aria-hidden /> : <ChevronUp aria-hidden />}
                <span className="sr-only">
                  {isNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
                </span>
              </Button>
            </div>
            <div
              id="admin-nav"
              className={cn(isNavCollapsed && 'hidden lg:block')}
            >
              <div className="mt-4">
                <AdminNav onNavigate={handleNavigate} />
              </div>
              {miniAppEnv !== 'mini' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => {
                    void handleSignOut();
                  }}
                >
                  Sign out
                </Button>
              ) : null}
            </div>
          </div>
        </aside>
        <div
          aria-hidden
          style={{ height: asideHeight }}
        />
      </div>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
