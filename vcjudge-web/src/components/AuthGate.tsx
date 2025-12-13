'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const ready =
    pathname?.startsWith('/login') ||
    (typeof window !== 'undefined' && localStorage.getItem('hv_authed') === '1');

  useEffect(() => {
    if (pathname?.startsWith('/login')) return;
    const ok = typeof window !== 'undefined' && localStorage.getItem('hv_authed') === '1';
    if (!ok) router.replace('/login');
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}