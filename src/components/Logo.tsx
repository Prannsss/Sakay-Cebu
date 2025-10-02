import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v12c0 .6.4 1 1 1h8"/><path d="M5 18h3"/><path d="M11 18h3"/><circle cx="7" cy="11" r="1"/><circle cx="17" cy="11" r="1"/></svg>
        <span className="font-headline">Sakay Cebu</span>
    </Link>
  );
};

export default Logo;
