import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getFeedRevalidateSecretOrThrow } from '@/env/server-env';
import { buildFeedPath } from '@/lib/feed/feed.routes';
import { getCommunitiesFresh } from '@/lib/community/community.server';
import { isRecord } from '@/lib/is-record';

export const runtime = 'nodejs';

interface RevalidateFeedRequestBody {
  readonly paths?: readonly string[];
}

const isRevalidateFeedRequestBody = (x: unknown): x is RevalidateFeedRequestBody => {
  if (!isRecord(x)) return false;
  const body = x;
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

  let bodyPaths: readonly string[] | undefined;
  if (body !== undefined) {
    if (!isRevalidateFeedRequestBody(body)) {
      return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
    }
    bodyPaths = body.paths;
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
