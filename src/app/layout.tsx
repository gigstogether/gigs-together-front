import type { Metadata } from 'next';
import './globals.css';
import GoatCounterAnalytics from '@/components/GoatCounterAnalytics';
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { clientEnv } from '@/env/client-env';
import { serverEnv } from '@/env/server-env';
import { createOpenGraphMetadata, getSitePreviewImageUrl } from '@/lib/open-graph';
import SignInHost from '@/components/auth/SignInHost';

const SITE_BASE_URL = serverEnv.appBaseUrl;
const GOATCOUNTER_ENDPOINT = serverEnv.isProductionSite ? clientEnv.goatCounterEndpoint : undefined;

const BRAND_NAME = serverEnv.brandName;
const TITLE = serverEnv.sitePreviewTitle;
const DESCRIPTION = serverEnv.sitePreviewDescription;
const FAVICON_URL = serverEnv.isDevelopment
  ? '/logo-dev-circle-96x96.png'
  : serverEnv.isStaging
    ? '/logo-stg-circle-96x96.png'
    : '/logo-circle-96x96.png';

const metadataBase = SITE_BASE_URL ? new URL(SITE_BASE_URL) : undefined;
const previewImage = getSitePreviewImageUrl();

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
  openGraph: createOpenGraphMetadata({
    title: TITLE,
    description: DESCRIPTION,
  }),
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
      alternateName: ['Gigs Together', 'GigsTogether'],
      url: SITE_BASE_URL,
    }
  : null;

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body>
        <GoatCounterAnalytics endpoint={GOATCOUNTER_ENDPOINT} />
        <QueryProvider>
          {jsonLd ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
              }}
            />
          ) : null}
          <div className="pt-[var(--header-h)]">{children}</div>
          <SignInHost />
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
