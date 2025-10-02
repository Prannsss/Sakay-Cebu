'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Car,
  LayoutDashboard,
  LogIn,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Compass,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from '@/components/Logo';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    ...(user ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { href: '/vehicles', label: 'Explore', icon: Compass },
    { href: '/smart-deals', label: 'Smart Deals', icon: Sparkles },
  ].sort((a, b) => {
    if (a.label === 'Dashboard') return -1;
    if (b.label === 'Dashboard') return 1;
    if (a.label === 'Explore') return -1;
    if (b.label === 'Explore') return 1;
    return 0;
  });

  const providerLinks = [
    { href: '/provider/dashboard', label: 'My Vehicles', icon: Car },
    { href: '/provider/add-vehicle', label: 'Add Vehicle', icon: PlusCircle },
  ];

  const adminLinks = [{ href: '/admin/dashboard', label: 'Admin Panel', icon: ShieldCheck }];

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
              <DropdownMenuSeparator />
              <p className="px-4 pt-2 text-xs font-semibold text-muted-foreground">PROVIDER</p>
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

          {user?.role === 'admin' && (
            <>
              <DropdownMenuSeparator />
              <p className="px-4 pt-2 text-xs font-semibold text-muted-foreground">ADMIN</p>
              {adminLinks.map((link) => (
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
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-left h-auto">
                  <div className="p-2 bg-muted rounded-full">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col ml-2">
                    <span className="font-medium text-sm">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className='capitalize font-normal text-muted-foreground'>{user.role}</DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="w-full" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
          </>
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
    <>
        <aside className="sticky top-0 h-screen w-64 flex-col border-r bg-background hidden lg:flex">
            <div className="flex h-16 shrink-0 items-center justify-center border-b px-6">
                <Logo />
            </div>
            {sidebarContent}
        </aside>
         <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
            <Logo />
            <div className='flex items-center gap-2'>
              <ThemeToggle />
              <Sheet>
              <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                  <div className="flex h-16 shrink-0 items-center justify-center border-b px-6">
                      <Logo />
                  </div>
                  {sidebarContent}
              </SheetContent>
              </Sheet>
            </div>
      </header>
    </>
  );
};

export default AppSidebar;
