import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDeniedGate() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center py-6 px-4">
      <Card className="w-full max-w-md border-0">
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
          <CardDescription>
            Your account is signed in, but it does not have moderator access. You cannot use this
            page.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
