import AppHeaderClient from '@/app/_components/AppHeaderClient';
import type { AppHeaderClientProps } from '@/app/_components/AppHeaderClient';

export type AppHeaderProps = AppHeaderClientProps;

export default function AppHeader(props: AppHeaderProps) {
  return (
    <header
      data-app-header
      className="app-header-mobile-width bg-background fixed top-0 left-0 z-50 h-[45px] w-full border-b"
    >
      <div className="w-full px-4 h-full">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center w-full h-full">
          <AppHeaderClient {...props} />
        </div>
      </div>
    </header>
  );
}
