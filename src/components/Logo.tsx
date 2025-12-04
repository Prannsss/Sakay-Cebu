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
    <Link href={getRedirectUrl()} className="flex items-center text-xl font-bold text-primary">
        <Image src="/favicon-1.png" alt="Sakay Cebu Logo" width={64} height={64} className="h-16 w-16 -mr-[-2]" />
        <span className="font-headline">Sakay Cebu</span>
    </Link>
  );
};

export default Logo;
