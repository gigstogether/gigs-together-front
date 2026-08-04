import { redirect } from 'next/navigation';
import { DEFAULT_FEED_PATH, DEFAULT_FEED_ROUTE } from '@/lib/feed/feed.routes';

interface GigPublicPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function GigPublicPage(props: GigPublicPageProps) {
  const { publicId } = await props.params;

  const trimmedPublicId = publicId.trim();

  if (!trimmedPublicId) {
    redirect(DEFAULT_FEED_ROUTE);
  }

  redirect(`${DEFAULT_FEED_PATH}#${trimmedPublicId}`);
}
