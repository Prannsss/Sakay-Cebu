'use client';

import { usePathname } from 'next/navigation';
import AppSidebar from '@/components/layout/AppSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
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
      <>
        <div className="flex min-h-screen bg-background">
          {/* Desktop Sidebar */}
          <AppSidebar />
          
          {/* Main Content */}
          <main className="flex-1 flex flex-col">
            {/* Page Content */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
              {/* Desktop Theme Toggle */}
              <div className='hidden lg:flex justify-end mb-6'>
                <ThemeToggle />
              </div>
              {children}
            </div>
          </main>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </>
    );
  }
  
  return <>{children}</>;
}
