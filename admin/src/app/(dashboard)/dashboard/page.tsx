'use client';

import { Users, DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';

export default function DashboardPage() {
  // Mock data - will be replaced with real API calls
  const stats = {
    totalUsers: 1234,
    activeSubscriptions: 856,
    monthlyRevenue: 42500,
    growthRate: '+12.5%',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome to the WhatsFlow admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={{ value: '+8.2%', positive: true }}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions.toLocaleString()}
          icon={CreditCard}
          trend={{ value: '+5.1%', positive: true }}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}K`}
          icon={DollarSign}
          trend={{ value: stats.growthRate, positive: true }}
        />
        <StatsCard
          title="Growth Rate"
          value={stats.growthRate}
          icon={TrendingUp}
          trend={{ value: '+2.3%', positive: true }}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">No recent users to display</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">No recent payments to display</p>
          </div>
        </div>
      </div>
    </div>
  );
}


