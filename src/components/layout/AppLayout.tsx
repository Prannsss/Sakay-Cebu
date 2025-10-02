'use client';

import { usePathname } from 'next/navigation';
import AppSidebar from '@/components/layout/AppSidebar';
import { ThemeToggle } from '../theme-toggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noSidebarPaths = ['/', '/login', '/signup'];
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const showSidebar = !noSidebarPaths.includes(pathname);

  if (isAuthPage) {
    return (
      <main className="w-full">
        {children}
      </main>
    );
  }

  if (showSidebar) {
    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="p-4 sm:p-6 md:p-8 flex-1">
            <div className='flex justify-end'>
                <ThemeToggle />
            </div>
            {children}
          </div>
        </main>
      </div>
    );
  }
  
  return <>{children}</>;
}
