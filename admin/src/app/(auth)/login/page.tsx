'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { adminAPI } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdmin, isAuthenticated, _hasHydrated } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (_hasHydrated && isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminAPI.login(email, password);
      console.log('Login response:', response.data);

      // Response structure: { success: true, data: { admin, token } }
      const { admin, token } = response.data.data;
      console.log('Destructured - Admin:', admin);
      console.log('Destructured - Token:', token);
      
      setAdmin(admin, token);
      
      // Give zustand time to persist
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Navigating to dashboard...');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-purple-600 rounded-xl mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsFlow Admin</h1>
          <p className="text-sm text-gray-600 mt-2">Sign in to access the control panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="admin@whatsflow.ai"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          This is a restricted admin area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}

