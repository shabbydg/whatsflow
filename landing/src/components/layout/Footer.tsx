import Link from 'next/link';
import { MessageSquare, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2153';

  return (
    <footer className="relative bg-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16 mb-12 lg:mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                WhatsFlow
              </span>
            </div>
            <p className="text-base text-gray-400 leading-relaxed max-w-sm">
              The complete WhatsApp Business platform for SMEs. Connect, automate, and grow with AI-powered messaging.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="h-5 w-5 text-purple-400" />
                <span className="text-sm">hello@whatsflow.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="h-5 w-5 text-purple-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="h-5 w-5 text-purple-400" />
                <span className="text-sm">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Use Cases', href: '#use-cases' },
                { label: 'Integrations', href: '/integrations' },
                { label: 'API Docs', href: `${appUrl}/docs` }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors duration-300 inline-flex items-center group">
                    {link.label}
                    <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Blog', href: '/blog' },
                { label: 'Careers', href: '/careers' },
                { label: 'Press Kit', href: '/press' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors duration-300 inline-flex items-center group">
                    {link.label}
                    <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy', href: '/cookies' },
                { label: 'GDPR', href: '/gdpr' },
                { label: 'Security', href: '/security' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors duration-300 inline-flex items-center group">
                    {link.label}
                    <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-400">
            © {currentYear} WhatsFlow. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            {[
              { label: 'Twitter', href: '#' },
              { label: 'LinkedIn', href: '#' },
              { label: 'GitHub', href: '#' },
              { label: 'YouTube', href: '#' }
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
              </a>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
              <span className="text-xs font-semibold text-gray-400">GDPR Compliant</span>
            </div>
            <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
              <span className="text-xs font-semibold text-gray-400">SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
