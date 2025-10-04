'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Car,
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Compass,
  User,
  MessageCircle,
  Calendar as CalendarIcon,
  ClipboardList,
  List,
} from 'lucide-react';

const MobileBottomNav = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    ...(user && user.role !== 'provider' ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(user?.role !== 'provider' ? [{ href: '/vehicles', label: 'Explore', icon: Compass }] : []),
    ...(user?.role !== 'provider' ? [{ href: '/smart-deals', label: 'Deals', icon: Sparkles }] : []),
    ...(user && user.role !== 'provider' ? [{ href: '/messages-client', label: 'Messages', icon: MessageCircle }] : []),
  ];

  const providerLinks = [
    { href: '/provider/dashboard', label: 'Vehicles', icon: Car },
    { href: '/provider/all-vehicles', label: 'All', icon: List },
    { href: '/provider/rental-requests', label: 'Requests', icon: ClipboardList },
    { href: '/messages-provider', label: 'Messages', icon: MessageCircle },
  ];

  let allLinks = [...navLinks];
  
  if (user?.role === 'provider') {
    allLinks = allLinks.concat(providerLinks);
  }

  // Limit to 5 items for mobile (4 nav + 1 profile)
  const displayLinks = allLinks.slice(0, 4);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
          {displayLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                pathname === link.href
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
          
          {user && (
            <Link
              href="/profile"
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                pathname === '/profile'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;