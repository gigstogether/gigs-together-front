import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/card';

interface AdminComingSoonProps {
  readonly title: string;
  readonly description: string;
}

export default function AdminComingSoon(props: AdminComingSoonProps) {
  const { title, description } = props;

  return (
    <>
      <AdminPageHeader
        title={title}
        description={description}
      />
      <Card className="border shadow-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          This section is coming soon.
        </CardContent>
      </Card>
    </>
  );
}
