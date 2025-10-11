'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { Header } from '@/components/admin/Header';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, token } = useAdminAuthStore();

  useEffect(() => {
    console.log('Dashboard layout - hasHydrated:', _hasHydrated, 'isAuthenticated:', isAuthenticated(), 'token:', token ? 'present' : 'missing');
    
    // Wait for store to hydrate before checking auth
    if (_hasHydrated && !isAuthenticated()) {
      console.log('Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [isAuthenticated, _hasHydrated, token, router]);

  // Show nothing while hydrating
  if (!_hasHydrated) {
    console.log('Store not hydrated yet, waiting...');
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    console.log('Not authenticated, returning null');
    return null;
  }

  console.log('Rendering dashboard layout');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}


