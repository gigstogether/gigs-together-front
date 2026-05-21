'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import AdminNav from '@/app/admin/_components/AdminNav';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const ADMIN_LABEL = 'ADMIN';

export default function AdminHeaderNavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            aria-label="Admin navigation menu"
          >
            {ADMIN_LABEL}
            <ChevronDown
              className="h-4 w-4"
              aria-hidden
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side="bottom"
          className="w-56 p-2"
        >
          <AdminNav onNavigate={handleNavigate} />
        </PopoverContent>
      </Popover>
      <span className="hidden text-sm font-medium text-muted-foreground lg:inline">
        {ADMIN_LABEL}
      </span>
    </>
  );
}
