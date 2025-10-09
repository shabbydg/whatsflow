'use client';

import { useEffect, useState } from 'react';
import { messagesAPI, contactsAPI, whatsappAPI } from '@/lib/api';
import { MessageSquare, Users, CheckCircle, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [messagesRes, contactsRes, statusRes] = await Promise.all([
        messagesAPI.getStats(7),
        contactsAPI.getAll(1, 1),
        whatsappAPI.getStatus(),
      ]);

      const messageStats = messagesRes.data.data;
      const totalMessages = messageStats.reduce((acc: number, day: any) => acc + day.total, 0);
      const totalSent = messageStats.reduce((acc: number, day: any) => acc + day.sent, 0);
      const totalReceived = messageStats.reduce((acc: number, day: any) => acc + day.received, 0);

      setStats({
        totalMessages,
        totalSent,
        totalReceived,
        totalContacts: contactsRes.data.data.pagination.total,
      });

      setWhatsappStatus(statusRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* WhatsApp Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">WhatsApp Connection</h2>
            <p className="text-sm text-gray-600 mt-1">
              {whatsappStatus?.status === 'connected'
                ? `Connected: ${whatsappStatus.phoneNumber}`
                : whatsappStatus?.status === 'qr_pending'
                ? 'Waiting for QR scan'
                : 'Not connected'}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              whatsappStatus?.status === 'connected'
                ? 'bg-green-100 text-green-800'
                : whatsappStatus?.status === 'qr_pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {whatsappStatus?.status === 'connected'
              ? 'Connected'
              : whatsappStatus?.status === 'qr_pending'
              ? 'Pending'
              : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Messages"
          value={stats?.totalMessages || 0}
          icon={MessageSquare}
          color="purple"
        />
        <StatCard
          title="Messages Sent"
          value={stats?.totalSent || 0}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Messages Received"
          value={stats?.totalReceived || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Contacts"
          value={stats?.totalContacts || 0}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/messages"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 transition-colors text-center"
          >
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium text-gray-900">Send Message</h3>
            <p className="text-sm text-gray-500 mt-1">Start a conversation</p>
          </a>
          <a
            href="/contacts"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 transition-colors text-center"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium text-gray-900">Manage Contacts</h3>
            <p className="text-sm text-gray-500 mt-1">View all contacts</p>
          </a>
          <a
            href="/settings"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 transition-colors text-center"
          >
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium text-gray-900">Settings</h3>
            <p className="text-sm text-gray-500 mt-1">Configure WhatsApp</p>
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
