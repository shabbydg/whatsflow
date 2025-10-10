'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdmin } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with actual admin login endpoint when backend is ready
      const response = await api.post('/admin/auth/login', {
        email,
        password,
      });

      const { admin, token } = response.data;
      setAdmin(admin, token);
      router.push('/dashboard');
    } catch (err: any) {
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

