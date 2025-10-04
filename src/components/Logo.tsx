import Link from 'next/link';
import { Zap } from 'lucide-react';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
        <Zap className="h-6 w-6" />
        <span className="font-headline">Sakay Cebu</span>
    </Link>
  );
};

export default Logo;
