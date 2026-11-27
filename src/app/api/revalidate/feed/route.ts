import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getFeedRevalidateSecretOrThrow } from '@/env/server-env';
import { buildFeedPath } from '@/lib/feed/feed.routes';
import { getCommunitiesFresh } from '@/lib/community/community.server';
import { COMMUNITY_CATALOG_CACHE_TAG } from '@/lib/community/community.api';
import { isRecord } from '@/lib/is-record';

export const runtime = 'nodejs';

interface RevalidateFeedRequestBody {
  paths?: string[];
  isCommunityCatalogChanged?: boolean;
}

const isRevalidateFeedRequestBody = (x: unknown): x is RevalidateFeedRequestBody => {
  if (!isRecord(x)) return false;
  const body = x;
  if (
    body.isCommunityCatalogChanged !== undefined &&
    typeof body.isCommunityCatalogChanged !== 'boolean'
  )
    return false;
  if (body.paths === undefined) return true;
  if (!Array.isArray(body.paths)) return false;
  return body.paths.every((p) => typeof p === 'string');
};

export async function POST(req: NextRequest) {
  let secret: string;
  try {
    secret = getFeedRevalidateSecretOrThrow();
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Server misconfigured' },
      { status: 503 },
    );
  }

  const provided = (req.headers.get('x-revalidate-secret') ?? '').trim();
  if (!provided || provided !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: unknown = undefined;
  if (req.headers.get('content-type')?.includes('application/json')) {
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
    }
  }

  let bodyPaths: string[] | undefined;
  let isCommunityCatalogChanged = false;
  if (body !== undefined) {
    if (!isRevalidateFeedRequestBody(body)) {
      return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
    }
    bodyPaths = body.paths;
    isCommunityCatalogChanged = body.isCommunityCatalogChanged === true;
  }

  if (isCommunityCatalogChanged) {
    revalidateTag(COMMUNITY_CATALOG_CACHE_TAG, { expire: 0 });
    revalidatePath('/feed/[country]/[communitySlug]', 'layout');
    revalidatePath('/suggest');
    revalidatePath('/sitemap.xml');
  }

  let paths = bodyPaths;
  if (paths === undefined) {
    const catalog = await getCommunitiesFresh();
    paths = catalog.communities.map((community) =>
      buildFeedPath({
        country: community.countryIso,
        communitySlug: community.slug,
      }),
    );
  }
  for (const path of paths) {
    revalidatePath(path);
  }

  return new NextResponse(null, { status: 204 });
}
