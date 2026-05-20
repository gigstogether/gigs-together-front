import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

interface GigFormLayoutProps {
  children: ReactNode;
}

// Gig form routes are kept in the codebase but hidden until admin tools ship.
export default function GigFormLayout(_props: GigFormLayoutProps) {
  notFound();
}
