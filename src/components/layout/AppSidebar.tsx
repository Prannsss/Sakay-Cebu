'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Car,
  LayoutDashboard,
  LogIn,
  PlusCircle,
  Sparkles,
  UserPlus,
  Compass,
  User,
  MessageCircle,
  Calendar as CalendarIcon,
  ClipboardList,
  List,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Logo from '@/components/Logo';

const AppSidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    ...(user && user.role !== 'provider' ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(user?.role !== 'provider' ? [{ href: '/vehicles', label: 'Explore', icon: Compass }] : []),
    ...(user?.role !== 'provider' ? [{ href: '/smart-deals', label: 'Smart Deals', icon: Sparkles }] : []),
    ...(user && user.role !== 'provider' ? [{ href: '/messages-client', label: 'Messages', icon: MessageCircle }] : []),
  ].sort((a, b) => {
    if (a.label === 'Dashboard') return -1;
    if (b.label === 'Dashboard') return 1;
    if (a.label === 'Explore') return -1;
    if (b.label === 'Explore') return 1;
    return 0;
  });

  const providerLinks = [
    { href: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/provider/add-vehicle', label: 'Add Vehicle', icon: PlusCircle },
    { href: '/provider/all-vehicles', label: 'View All Vehicles', icon: List },
    { href: '/provider/rental-requests', label: 'Rental Requests', icon: ClipboardList },
    { href: '/provider/calendar', label: 'Calendar', icon: CalendarIcon },
    { href: '/messages-provider', label: 'Messages', icon: MessageCircle },
  ];

  const sidebarContent = (
    <>
      <nav className="flex-1 overflow-y-auto pt-4">
        <ul className="p-4 space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Button
                variant={pathname === link.href ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={link.href}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            </li>
          ))}

          {user?.role === 'provider' && (
            <>
              {providerLinks.map((link) => (
                <li key={link.href}>
                  <Button
                    variant={pathname === link.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={link.href}>
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>
      <div className="mt-auto border-t p-4 space-y-2">
        {user ? (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left h-auto"
            asChild
          >
            <Link href="/profile">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col ml-2">
                <span className="font-medium text-sm">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </Link>
          </Button>
        ) : (
          <div className="space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button className="w-full" asChild>
              <Link href="/login">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <aside className="sticky top-0 h-screen w-64 flex-col border-r bg-background hidden lg:flex">
      <div className="flex h-16 shrink-0 items-center justify-center border-b px-6">
        <Logo />
      </div>
      {sidebarContent}
    </aside>
  );
};

export default AppSidebar;
