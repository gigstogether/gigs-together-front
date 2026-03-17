import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';
import { HeaderConfigProvider } from '@/app/_components/HeaderConfigProvider';
import AppHeader from '@/app/_components/AppHeader';

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

const SITE_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL;

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Gigs Together';
const TITLE = process.env.NEXT_PUBLIC_SITE_PREVIEW_TITLE ?? 'Gigs Together!';
const DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_PREVIEW_DESCRIPTION ?? 'Find gigs and company in your city.';
const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const PREVIEW_IMAGE = `/logo-${IMAGE_WIDTH}x${IMAGE_HEIGHT}.png`;

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
    icon: [{ url: '/logo-circle-96x96.png', type: 'image/png', sizes: '96x96' }],
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
      </body>
    </html>
  );
}
