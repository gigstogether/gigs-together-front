import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_FEED_ROUTE } from '@/lib/feed.routes';

export default function SuggestPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--header-h))] w-full max-w-md items-start px-4 py-6">
      <Card className="w-full border-0">
        <CardHeader>
          <CardTitle>Under development</CardTitle>
          <CardDescription>Gig suggestion flow is not available yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={DEFAULT_FEED_ROUTE}>Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
