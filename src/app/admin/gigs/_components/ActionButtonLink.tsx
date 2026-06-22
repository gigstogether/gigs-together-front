import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ActionButtonLinkProps {
  readonly href: string;
  readonly label: string;
  readonly icon: ReactNode;
  readonly isDisabled?: boolean;
}

export default function ActionButtonLink(props: ActionButtonLinkProps) {
  const { href, label, icon, isDisabled } = props;

  if (isDisabled) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 w-full gap-1 px-2"
        disabled
      >
        {icon}
        {label}
        <ExternalLink
          className="ml-auto h-3 w-3 opacity-60"
          aria-hidden
        />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 w-full gap-1 px-2"
      asChild
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {icon}
        {label}
        <ExternalLink
          className="ml-auto h-3 w-3 opacity-60"
          aria-hidden
        />
      </a>
    </Button>
  );
}
