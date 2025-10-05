'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const Logo = () => {
  const { user } = useAuth();
  
  // Determine redirect URL based on user role
  const getRedirectUrl = () => {
    if (!user) return '/';
    return user.role === 'provider' ? '/provider/dashboard' : '/dashboard';
  };

  return (
    <Link href={getRedirectUrl()} className="flex items-center gap-2 text-xl font-bold text-primary">
        <Zap className="h-6 w-6" />
        <span className="font-headline">Sakay Cebu</span>
    </Link>
  );
};

export default Logo;
