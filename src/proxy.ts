import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { buildFeedPath, DEFAULT_FEED_PATH, SUPPORTED_FEED_LOCATIONS } from '@/lib/feed/feed.routes';

const SUPPORTED_FEED_PATHS = new Set<string>(SUPPORTED_FEED_LOCATIONS.map(buildFeedPath));

function normalizeFeedPathname(pathname: string): string {
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname, search } = nextUrl;

  // Allow supported feed locations, including an optional trailing slash, to avoid redirect loops.
  if (SUPPORTED_FEED_PATHS.has(normalizeFeedPathname(pathname))) {
    return NextResponse.next();
  }

  const url = nextUrl.clone();
  url.pathname = DEFAULT_FEED_PATH;
  url.search = search; // preserve query string
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/feed/:path*'],
};
