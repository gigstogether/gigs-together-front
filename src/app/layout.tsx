import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';
import PlausibleAnalyticsProvider from '@/providers/PlausibleAnalyticsProvider';
import TelegramWebAppScript from '@/components/TelegramWebAppScript';
import { QueryProvider } from '@/providers/QueryProvider';
import { serverEnv } from '@/env/server-env';

const SITE_BASE_URL = serverEnv.appBaseUrl;

const BRAND_NAME = serverEnv.brandName;
const TITLE = serverEnv.sitePreviewTitle;
const DESCRIPTION = serverEnv.sitePreviewDescription;
const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const PREVIEW_IMAGE = `/logo-${IMAGE_WIDTH}x${IMAGE_HEIGHT}.png`;
const FAVICON_URL = serverEnv.isDevelopment
  ? '/logo-dev-circle-96x96.png'
  : serverEnv.isStaging
    ? '/logo-stg-circle-96x96.png'
    : '/logo-circle-96x96.png';

const metadataBase = SITE_BASE_URL ? new URL(SITE_BASE_URL) : undefined;
const previewImage = metadataBase ? new URL(PREVIEW_IMAGE, metadataBase).toString() : PREVIEW_IMAGE;

const sharedMetadata = {
  metadataBase,
  applicationName: BRAND_NAME,
  title: {
    default: TITLE,
    template: `%s | ${TITLE}`,
  },
  description: DESCRIPTION,
  icons: {
    icon: [{ url: FAVICON_URL, type: 'image/png', sizes: '96x96' }],
    apple: [{ url: '/logo-circle-180x180.png', sizes: '180x180' }],
  },
} satisfies Metadata;

const socialMetadata = {
  openGraph: {
    type: 'website',
    siteName: BRAND_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_BASE_URL ?? undefined,
    images: [
      {
        url: previewImage,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [previewImage],
  },
} satisfies Pick<Metadata, 'openGraph' | 'twitter'>;

const NON_PRODUCTION_ROBOTS: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
  },
};

export const metadata: Metadata = serverEnv.isProductionSite
  ? {
      ...sharedMetadata,
      ...socialMetadata,
      alternates: {
        canonical: '/',
      },
    }
  : {
      ...sharedMetadata,
      ...socialMetadata,
      robots: NON_PRODUCTION_ROBOTS,
    };

const jsonLd = serverEnv.isProductionSite
  ? {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: BRAND_NAME,
      alternateName: ['GigsTogether', 'Gigs Together!'],
      url: SITE_BASE_URL,
    }
  : null;

// TODO: refactor. Maybe "AppShell"?
export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PlausibleAnalyticsProvider>
          <QueryProvider>
            <TelegramWebAppScript />
            {jsonLd ? (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
                }}
              />
            ) : null}
            <div className="pt-[var(--header-h)]">{children}</div>
            <Toaster />
          </QueryProvider>
        </PlausibleAnalyticsProvider>
      </body>
    </html>
  );
}
