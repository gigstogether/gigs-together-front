import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';
import { HeaderConfigProvider } from '@/app/_components/HeaderConfigProvider';
import AppHeader from '@/app/_components/AppHeader';
import TelegramWebAppScript from '@/app/gig-form/_components/TelegramWebAppScript';
import { QueryProvider } from '@/app/_providers/QueryProvider';
import { clientEnv } from '@/env/client-env';

const geistSans = localFont({
  src: '../../public/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: '../../public/fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const SITE_BASE_URL = clientEnv.appBaseUrl;

const BRAND_NAME = clientEnv.brandName;
const TITLE = clientEnv.sitePreviewTitle;
const DESCRIPTION = clientEnv.sitePreviewDescription;
const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const PREVIEW_IMAGE = `/logo-${IMAGE_WIDTH}x${IMAGE_HEIGHT}.png`;
const FAVICON_URL = clientEnv.isDevelopment
  ? '/logo-dev-circle-96x96.png'
  : '/logo-circle-96x96.png';

const metadataBase = SITE_BASE_URL ? new URL(SITE_BASE_URL) : undefined;
const previewImage = new URL(PREVIEW_IMAGE, metadataBase).toString();

export const metadata: Metadata = {
  metadataBase,
  applicationName: BRAND_NAME,
  title: {
    default: TITLE,
    template: `%s | ${TITLE}`,
  },
  description: DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: FAVICON_URL, type: 'image/png', sizes: '96x96' }],
    apple: [{ url: '/logo-circle-180x180.png', sizes: '180x180' }],
  },
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
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: BRAND_NAME,
  alternateName: ['GigsTogether', 'Gigs Together!'],
  url: SITE_BASE_URL,
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
          <TelegramWebAppScript />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
            }}
          />
          <HeaderConfigProvider>
            <AppHeader />
            <div className="pt-[45px]">{children}</div>
            <Toaster />
          </HeaderConfigProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
