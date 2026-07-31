import AppHeader from '@/app/_components/AppHeader';
import { normalizeSegment } from '@/lib/feed.routes';
import HeaderCalendar from '@/app/_components/HeaderCalendar';

export default async function FeedLayout(props: LayoutProps<'/feed/[country]/[city]'>) {
  const { children, params } = props;
  const { country, city } = await params;

  return (
    <>
      <AppHeader
        country={normalizeSegment(country)}
        city={normalizeSegment(city)}
      >
        <HeaderCalendar
          country={country}
          city={city}
        />
      </AppHeader>
      {children}
    </>
  );
}
