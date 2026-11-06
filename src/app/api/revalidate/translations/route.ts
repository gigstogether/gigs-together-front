import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTranslationsRevalidateSecretOrThrow } from '@/env/server-env';
import { isRecord } from '@/lib/is-record';
import {
  buildTranslationNamespaceCacheTag,
  isValidTranslationNamespace,
} from '@/lib/i18n/translation-identifiers';
import { getCommunitiesFresh } from '@/lib/community/community.server';
import { buildFeedPath } from '@/lib/feed/feed.routes';

export const runtime = 'nodejs';

interface RevalidateTranslationsRequestBody {
  readonly namespace: string;
}

interface RevalidateTranslationNamespaceParams {
  namespace: string;
}

const TRANSLATION_NAMESPACE_REVALIDATE_PATHS: Readonly<Record<string, readonly string[]>> = {
  about: ['/about'],
  llms: ['/llms.txt'],
};

const FEED_TRANSLATION_NAMESPACES = ['community', 'country', 'city'] as const;

const isRevalidateTranslationsRequestBody = (
  x: unknown,
): x is RevalidateTranslationsRequestBody => {
  if (!isRecord(x)) return false;
  return typeof x.namespace === 'string';
};

async function getRevalidatePathsForTranslationNamespace(
  namespace: string,
): Promise<readonly string[]> {
  if (FEED_TRANSLATION_NAMESPACES.some((feedNamespace) => feedNamespace === namespace)) {
    const catalog = await getCommunitiesFresh();
    return catalog.communities.map((community) =>
      buildFeedPath({
        country: community.countryIso,
        communitySlug: community.slug,
      }),
    );
  }

  const paths = TRANSLATION_NAMESPACE_REVALIDATE_PATHS[namespace];
  if (paths === undefined) {
    return [];
  }

  return paths;
}

function revalidateTranslationNamespaceCache(params: RevalidateTranslationNamespaceParams): void {
  const { namespace } = params;

  revalidateTag(buildTranslationNamespaceCacheTag(namespace), { expire: 0 });
}

async function revalidateTranslationNamespacePaths(
  params: RevalidateTranslationNamespaceParams,
): Promise<void> {
  const { namespace } = params;

  const paths = await getRevalidatePathsForTranslationNamespace(namespace);
  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function POST(req: NextRequest) {
  let secret: string;
  try {
    secret = getTranslationsRevalidateSecretOrThrow();
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Server misconfigured' },
      { status: 503 },
    );
  }

  const provided = (req.headers.get('x-translations-revalidate-secret') ?? '').trim();
  if (!provided || provided !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!isRevalidateTranslationsRequestBody(body)) {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const namespace = body.namespace.trim();
  if (!namespace || !isValidTranslationNamespace(namespace)) {
    return NextResponse.json({ ok: false, error: 'Invalid namespace' }, { status: 400 });
  }

  revalidateTranslationNamespaceCache({ namespace });
  await revalidateTranslationNamespacePaths({ namespace });

  return new NextResponse(null, { status: 204 });
}
