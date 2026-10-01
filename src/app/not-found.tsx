import Link from 'next/link';

import Header from '@/components/header/Header';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100dvh-var(--header-h))] items-center justify-center px-4 py-12">
        <section
          className="max-w-md text-center"
          aria-labelledby="not-found-title"
        >
          <p className="text-sm font-semibold text-muted-foreground">404</p>
          <h1
            id="not-found-title"
            className="mt-2 text-3xl font-bold tracking-tight"
          >
            Page not found
          </h1>
          <p className="mt-3 text-muted-foreground">
            The page you are looking for does not exist or may have moved.
          </p>
          <Button
            asChild
            className="mt-6"
          >
            <Link href="/">Go to home page</Link>
          </Button>
        </section>
      </main>
    </>
  );
}
