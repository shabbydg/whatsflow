'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Lock, Webhook, MessageSquare, Smartphone, Users, Zap } from 'lucide-react';

const navigation = [
  { name: 'Introduction', href: '/docs', icon: Home },
  { name: 'Authentication', href: '/docs/authentication', icon: Lock },
  { name: 'Webhooks', href: '/docs/webhooks', icon: Webhook },
  { name: 'Messaging', href: '/docs/messaging', icon: MessageSquare },
  { name: 'Devices', href: '/docs/devices', icon: Smartphone },
  { name: 'Contacts', href: '/docs/contacts', icon: Users },
  { name: 'Rate Limits', href: '/docs/rate-limits', icon: Zap },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">API Documentation</h2>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

