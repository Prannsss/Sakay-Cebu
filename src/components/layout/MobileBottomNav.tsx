'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Car,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Compass,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

const MobileBottomNav = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    ...(user ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { href: '/vehicles', label: 'Explore', icon: Compass },
    { href: '/smart-deals', label: 'Deals', icon: Sparkles },
  ];

  const providerLinks = [
    { href: '/provider/dashboard', label: 'Vehicles', icon: Car },
    { href: '/provider/add-vehicle', label: 'Add', icon: PlusCircle },
  ];

  const adminLinks = [{ href: '/admin/dashboard', label: 'Admin', icon: ShieldCheck }];

  let allLinks = [...navLinks];
  
  if (user?.role === 'provider') {
    allLinks = allLinks.concat(providerLinks);
  }
  
  if (user?.role === 'admin') {
    allLinks = allLinks.concat(adminLinks);
  }

  // Limit to 5 items for mobile
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
            <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <PopoverTrigger asChild>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-muted-foreground hover:text-primary hover:bg-primary/5 cursor-pointer">
                  <User className="h-5 w-5" />
                  <span className="text-xs mt-1">Profile</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 mb-2" align="end" side="top">
                <div className="space-y-2">
                  <div className="px-2 py-1 border-b">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;