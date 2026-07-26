import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTranslationsRevalidateSecretOrThrow } from '@/env/server-env';
import { isRecord } from '@/lib/is-record';
import {
  buildTranslationNamespaceCacheTag,
  isValidTranslationNamespace,
} from '@/lib/translation-identifiers';

export const runtime = 'nodejs';

interface RevalidateTranslationsRequestBody {
  readonly namespace: string;
}

interface RevalidateTranslationNamespaceCacheParams {
  readonly namespace: string;
}

const TRANSLATION_NAMESPACE_REVALIDATE_PATHS: Readonly<Record<string, readonly string[]>> = {
  about: ['/about'],
};

const isRevalidateTranslationsRequestBody = (
  x: unknown,
): x is RevalidateTranslationsRequestBody => {
  if (!isRecord(x)) return false;
  return typeof x.namespace === 'string';
};

function getRevalidatePathsForTranslationNamespace(namespace: string): readonly string[] {
  const paths = TRANSLATION_NAMESPACE_REVALIDATE_PATHS[namespace];
  if (paths === undefined) {
    return [];
  }

  return paths;
}

function revalidateTranslationNamespaceCache(
  params: RevalidateTranslationNamespaceCacheParams,
): void {
  const { namespace } = params;

  revalidateTag(buildTranslationNamespaceCacheTag(namespace), { expire: 0 });

  for (const path of getRevalidatePathsForTranslationNamespace(namespace)) {
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

  return new NextResponse(null, { status: 204 });
}
