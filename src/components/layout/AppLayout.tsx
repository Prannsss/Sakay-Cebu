'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, ReactNode } from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { ThemeToggle } from '../theme-toggle';

interface BottomNavContextType {
  hideBottomNav: boolean;
  setHideBottomNav: (hide: boolean) => void;
}

const BottomNavContext = createContext<BottomNavContextType>({
  hideBottomNav: false,
  setHideBottomNav: () => {},
});

export const useBottomNav = () => useContext(BottomNavContext);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noSidebarPaths = ['/', '/login', '/signup'];
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const showSidebar = !noSidebarPaths.includes(pathname);
  const [hideBottomNav, setHideBottomNav] = useState(false);

  if (isAuthPage) {
    return (
      <main className="w-full">
        {children}
      </main>
    );
  }

  if (showSidebar) {
    return (
      <BottomNavContext.Provider value={{ hideBottomNav, setHideBottomNav }}>
        <div className="flex min-h-screen bg-background">
          {/* Desktop Sidebar */}
          <AppSidebar />
          
          {/* Main Content */}
          <main className="flex-1 flex flex-col">
            {/* Page Content */}
            <div className="flex-1 pb-20 lg:pb-8">
              {children}
            </div>
          </main>
        </div>
        
        {/* Mobile Bottom Navigation - Hidden when in conversation */}
        {!hideBottomNav && <MobileBottomNav />}
      </BottomNavContext.Provider>
    );
  }
  
  return <>{children}</>;
}
