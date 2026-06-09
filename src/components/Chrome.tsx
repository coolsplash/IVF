'use client';

import { usePathname } from 'next/navigation';
// import Footer removed

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isHome = pathname === '/';
  // List of paths that SHOULD have a footer (if they aren't the home page)
  const knownStaticPaths = ['/donate', '/faq', '/how-it-works'];
  const isStaticPath = knownStaticPaths.includes(pathname || '');

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <main className="flex-grow">{children}</main>
      {/* Only show footer on static known paths, not on home (which has its own) or personal pages */}
      
    </>
  );
}

