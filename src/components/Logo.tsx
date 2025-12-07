'use client';

import Link from 'next/link';
import Image from 'next/image';
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
        <Image src="/favicon.ico" alt="Sakay Cebu Logo" width={48} height={48} className="h-24 w-24 object-contain" />
        <span className="font-headline">Sakay Cebu</span>
    </Link>
  );
};

export default Logo;
