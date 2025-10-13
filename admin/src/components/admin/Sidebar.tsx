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
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 w-64 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-6 border-b border-gray-800 bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">WhatsFlow</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className={clsx(
                'h-5 w-5 mr-3 transition-transform',
                isActive ? '' : 'group-hover:scale-110'
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Admin Info & Logout */}
      <div className="border-t border-gray-800 p-4 bg-gray-950">
        <div className="mb-4 p-3 rounded-xl bg-gray-800/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {admin?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Signed in as</p>
              <p className="text-sm font-semibold text-white truncate">{admin?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-900/50 text-xs font-medium text-purple-300 capitalize">
              {admin?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-400 rounded-xl hover:bg-red-900/50 hover:text-red-300 transition-all group"
        >
          <LogOut className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
}


