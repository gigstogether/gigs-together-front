import AppHeader from '@/app/_components/AppHeader';
import { normalizeSegment } from '@/lib/feed.routes';

export default async function FeedLayout(props: LayoutProps<'/feed/[country]/[city]'>) {
  const { children, params } = props;
  const { country, city } = await params;

  return (
    <>
      <AppHeader
        country={normalizeSegment(country)}
        city={normalizeSegment(city)}
        showCalendar
      />
      {children}
    </>
  );
}
