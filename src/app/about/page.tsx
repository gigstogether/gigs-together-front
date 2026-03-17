import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Gigs Together! — Find gigs and company in your city.',
};

export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">About</h1>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          Gigs Together! helps you find gigs and connect with people in your city. We curate live
          music events and make it easy to discover what&apos;s happening around you.
        </p>
        <p>
          Currently we focus on Barcelona. Join our Telegram community to stay updated and suggest
          gigs!
        </p>
      </div>
    </main>
  );
}
