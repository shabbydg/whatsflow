'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  DollarSign, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard },
  { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuthStore();

  return (
    <div className="flex flex-col h-full bg-gray-900 w-64">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">WhatsFlow Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Admin Info & Logout */}
      <div className="border-t border-gray-800 p-4">
        <div className="mb-3">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="text-sm font-medium text-white truncate">{admin?.email}</p>
          <p className="text-xs text-gray-500 capitalize">{admin?.role?.replace('_', ' ')}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}


