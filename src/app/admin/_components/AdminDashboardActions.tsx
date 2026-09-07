'use client';

import { useState } from 'react';
import { Loader2, Megaphone, RefreshCw } from 'lucide-react';

import { useAdminDashboardActions } from '@/app/admin/_hooks/use-admin-dashboard-actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminDashboardActions() {
  const [isDigestConfirmOpen, setIsDigestConfirmOpen] = useState(false);
  const {
    isPostingDigest,
    isRevalidatingFeed,
    isRevalidatingTranslations,
    postDigestAsync,
    revalidateFeed,
    revalidateTranslations,
  } = useAdminDashboardActions();

  const isBusy = isPostingDigest || isRevalidatingFeed || isRevalidatingTranslations;

  const confirmPostDigest = async (): Promise<void> => {
    try {
      await postDigestAsync();
      setIsDigestConfirmOpen(false);
    } catch {
      return;
    }
  };

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Actions</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={() => {
            setIsDigestConfirmOpen(true);
          }}
        >
          {isPostingDigest ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden
            />
          ) : (
            <Megaphone
              className="h-4 w-4"
              aria-hidden
            />
          )}
          Post digest
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={revalidateTranslations}
        >
          {isRevalidatingTranslations ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden
            />
          ) : (
            <RefreshCw
              className="h-4 w-4"
              aria-hidden
            />
          )}
          Revalidate translations
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={revalidateFeed}
        >
          {isRevalidatingFeed ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden
            />
          ) : (
            <RefreshCw
              className="h-4 w-4"
              aria-hidden
            />
          )}
          Revalidate feed
        </Button>
      </div>

      <Dialog
        open={isDigestConfirmOpen}
        onOpenChange={setIsDigestConfirmOpen}
      >
        <DialogTrigger className="hidden">Open digest post confirm dialog</DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post weekly digest?</DialogTitle>
            <DialogDescription>
              This posts the digest to Telegram immediately, outside the scheduled Monday run.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPostingDigest}
              onClick={() => {
                setIsDigestConfirmOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPostingDigest}
              onClick={() => {
                void confirmPostDigest();
              }}
            >
              {isPostingDigest ? (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden
                />
              ) : null}
              Yes, post now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
