'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import AdminNav from '@/app/admin/_components/AdminNav';

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
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
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8">
      <div className="hidden w-full shrink-0 lg:block lg:w-56">
        <aside
          ref={asideRef}
          className="fixed z-40 top-[calc(var(--header-h)+1.5rem)] max-h-[calc(100dvh-var(--header-h)-3rem)] lg:left-[calc((100vw-min(100vw,72rem))/2+1rem)] lg:w-56"
        >
          <div className="max-h-[inherit] overflow-y-auto rounded-xl border bg-card p-4 shadow-sm">
            <AdminNav />
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
