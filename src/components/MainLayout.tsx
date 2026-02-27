import type { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: ReactNode;
  showTopNav?: boolean;
  showBottomNav?: boolean;
  topNavTitle?: string;
  showBack?: boolean;
  showSettings?: boolean;
}

export function MainLayout({
  children,
  showTopNav = true,
  showBottomNav = true,
  topNavTitle,
  showBack = false,
  showSettings = false,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {showTopNav && (
        <TopNav title={topNavTitle} showBack={showBack} showSettings={showSettings} />
      )}
      <main className={showBottomNav ? 'pb-20' : ''}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
