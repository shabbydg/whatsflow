'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { MessageSquare, Users, Settings, BarChart3, LogOut, Menu, X, ChevronDown, ChevronRight, Smartphone, Brain, Globe, Megaphone, Target, CreditCard } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [settingsOpen, setSettingsOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Leads', href: '/leads', icon: Target },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  ];

  const [billingOpen, setBillingOpen] = useState(false);

  const settingsNavigation = [
    { name: 'General', href: '/settings', icon: Settings },
    { name: 'Devices', href: '/settings/devices', icon: Smartphone },
    { name: 'Personas', href: '/settings/personas', icon: Brain },
    { name: 'Business Profile', href: '/settings/profile', icon: Globe },
  ];

  const billingNavigation = [
    { name: 'Overview', href: '/billing', icon: CreditCard },
    { name: 'Plans', href: '/billing/plans', icon: BarChart3 },
    { name: 'Invoices', href: '/billing/invoices', icon: Globe },
    { name: 'Settings', href: '/billing/settings', icon: Settings },
  ];

  if (!mounted || !isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-purple-600">WhatsFlow</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            {/* Billing Section with Submenu */}
            <div className="space-y-1">
              <button
                onClick={() => setBillingOpen(!billingOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                  pathname.startsWith('/billing')
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Billing</span>
                </div>
                {billingOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Billing Submenu */}
              {billingOpen && (
                <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                  {billingNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                          isActive
                            ? 'bg-purple-50 text-purple-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Settings Section with Submenu */}
            <div className="space-y-1">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                  pathname.startsWith('/settings')
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </div>
                {settingsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Settings Submenu */}
              {settingsOpen && (
                <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                  {settingsNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                          isActive
                            ? 'bg-purple-50 text-purple-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center h-16 px-6 bg-white border-b border-gray-200 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-500" />
          </button>
          <h1 className="ml-4 text-xl font-bold text-purple-600">WhatsFlow</h1>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
