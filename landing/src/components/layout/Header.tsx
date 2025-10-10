'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2153';

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <MessageSquare className="h-7 w-7 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">WhatsFlow</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Link href={`${appUrl}/login`}>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href={`${appUrl}/register`}>
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

