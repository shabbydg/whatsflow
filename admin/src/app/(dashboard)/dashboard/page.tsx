'use client';

import { Users, DollarSign, CreditCard, TrendingUp, MessageSquare, Activity, CheckCircle, XCircle } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';

export default function DashboardPage() {
  // Mock data - will be replaced with real API calls
  const stats = {
    totalUsers: 1234,
    activeSubscriptions: 856,
    monthlyRevenue: 42500,
    growthRate: '+12.5%',
    totalMessages: 145678,
    activeDevices: 432,
  };

  const recentUsers = [
    { name: 'John Smith', email: 'john@example.com', plan: 'Professional', status: 'active', date: '2 hours ago' },
    { name: 'Sarah Johnson', email: 'sarah@example.com', plan: 'Starter', status: 'active', date: '5 hours ago' },
    { name: 'Mike Chen', email: 'mike@example.com', plan: 'Enterprise', status: 'active', date: '1 day ago' },
  ];

  const recentPayments = [
    { user: 'john@example.com', amount: 99, plan: 'Professional', status: 'completed', date: '2 hours ago' },
    { user: 'sarah@example.com', amount: 29, plan: 'Starter', status: 'completed', date: '4 hours ago' },
    { user: 'mike@example.com', amount: 299, plan: 'Enterprise', status: 'pending', date: '1 day ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100">Welcome back! Here's an overview of your WhatsFlow platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Last 30 days</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalMessages.toLocaleString()}</div>
          <div className="text-blue-100">Total Messages Sent</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Currently</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.activeDevices}</div>
          <div className="text-green-100">Active Devices</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Recent Users
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-lg mb-1">
                      {user.plan}
                    </div>
                    <div className="text-xs text-gray-500">{user.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Recent Payments
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">${payment.amount}</div>
                    <div className="text-sm text-gray-600">{payment.user}</div>
                    <div className="text-xs text-gray-500 mt-1">{payment.date}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg mb-1 ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {payment.status}
                    </div>
                    <div className="text-xs text-gray-600">{payment.plan}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


