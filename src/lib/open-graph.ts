import 'server-only';

import type { Metadata } from 'next';
import { serverEnv } from '@/env/server-env';

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const PREVIEW_IMAGE_PATH = `/logo-${IMAGE_WIDTH}x${IMAGE_HEIGHT}.png`;

export interface CreateOpenGraphMetadataParams {
  url?: string;
  title: string;
  description: string;
}

function resolveSiteUrl(path: string): string {
  return serverEnv.appBaseUrl ? new URL(path, serverEnv.appBaseUrl).toString() : path;
}

export function getSitePreviewImageUrl(): string {
  return resolveSiteUrl(PREVIEW_IMAGE_PATH);
}

export function createOpenGraphMetadata(
  params: CreateOpenGraphMetadataParams,
): NonNullable<Metadata['openGraph']> {
  const { url, title, description } = params;

  return {
    type: 'website',
    siteName: serverEnv.brandName,
    title,
    description,
    ...(url === undefined ? {} : { url: resolveSiteUrl(url) }),
    images: [
      {
        url: getSitePreviewImageUrl(),
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        alt: title,
      },
    ],
  };
}
