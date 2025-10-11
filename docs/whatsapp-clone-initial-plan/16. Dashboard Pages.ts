// FILE: src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { whatsappAPI, messagesAPI, contactsAPI } from '@/lib/api';
import { MessageSquare, Users, Send, CheckCircle } from 'lucide-react';
import WhatsAppConnection from '@/components/whatsapp/WhatsAppConnection';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalMessages: 0,
    messagesThisWeek: 0,
    whatsappConnected: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [contactsRes, messagesRes, whatsappRes] = await Promise.all([
        contactsAPI.getAll(1, 1),
        messagesAPI.getStats(7),
        whatsappAPI.getStatus(),
      ]);

      const totalContacts = contactsRes.data.data.pagination.total;
      const messageStats = messagesRes.data.data;
      const whatsappStatus = whatsappRes.data.data.status;

      const messagesThisWeek = messageStats.reduce((sum: number, day: any) => sum + day.total, 0);

      setStats({
        totalContacts,
        totalMessages: messagesThisWeek,
        messagesThisWeek,
        whatsappConnected: whatsappStatus === 'connected',
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your WhatsApp business</p>
      </div>

      {/* WhatsApp Connection Card */}
      <WhatsAppConnection onStatusChange={loadStats} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon={Users}
          color="bg-blue-500"
          loading={loading}
        />
        <StatCard
          title="Messages (7 days)"
          value={stats.messagesThisWeek}
          icon={MessageSquare}
          color="bg-green-500"
          loading={loading}
        />
        <StatCard
          title="Connection Status"
          value={stats.whatsappConnected ? 'Connected' : 'Disconnected'}
          icon={stats.whatsappConnected ? CheckCircle : Send}
          color={stats.whatsappConnected ? 'bg-green-500' : 'bg-gray-400'}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            title="Send Message"
            description="Send a message to a contact"
            href="/messages"
            icon={Send}
          />
          <QuickActionButton
            title="Add Contact"
            description="Add a new contact"
            href="/contacts"
            icon={Users}
          />
          <QuickActionButton
            title="Create Campaign"
            description="Start a broadcast campaign"
            href="/campaigns"
            icon={MessageSquare}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  loading 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ 
  title, 
  description, 
  href, 
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  href: string; 
  icon: any;
}) {
  return (
    <a
      href={href}
      className="block p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition group"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-500 transition">
          <Icon className="w-5 h-5 text-purple-600 group-hover:text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
}

// ============================================

// FILE: src/components/whatsapp/WhatsAppConnection.tsx
'use client';

import { useEffect, useState } from 'react';
import { whatsappAPI } from '@/lib/api';
import { useWhatsAppStore } from '@/stores/whatsappStore';
import { Smartphone, QrCode, CheckCircle, XCircle, Loader } from 'lucide-react';
import QRCode from 'qrcode.react';

interface Props {
  onStatusChange?: () => void;
}

export default function WhatsAppConnection({ onStatusChange }: Props) {
  const { status, setStatus } = useWhatsAppStore();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    checkStatus();
    // Poll for status updates every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await whatsappAPI.getStatus();
      setStatus(response.data.data);
      
      if (response.data.data.status === 'connected') {
        setShowQR(false);
        onStatusChange?.();
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleConnect = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      await whatsappAPI.connect(phoneNumber);
      setShowQR(true);
      checkStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp?')) return;

    setLoading(true);
    try {
      await whatsappAPI.disconnect();
      setShowQR(false);
      checkStatus();
      onStatusChange?.();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status?.status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'qr_pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disconnected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status?.status) {
      case 'connected': return <CheckCircle className="w-5 h-5" />;
      case 'qr_pending': return <Loader className="w-5 h-5 animate-spin" />;
      case 'disconnected': return <XCircle className="w-5 h-5" />;
      default: return <Smartphone className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    switch (status?.status) {
      case 'connected': return `Connected (${status.phoneNumber})`;
      case 'qr_pending': return 'Waiting for QR scan...';
      case 'disconnected': return 'Not connected';
      default: return 'Not connected';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Smartphone className="w-6 h-6 text-gray-700" />
          <h2 className="text-xl font-semibold">WhatsApp Connection</h2>
        </div>
        
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>
      </div>

      {status?.status === 'connected' ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Your WhatsApp is connected and ready to send/receive messages.
          </p>
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : status?.status === 'qr_pending' && status.qrCode ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Scan this QR code with your WhatsApp mobile app:
          </p>
          <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
            <QRCode value={status.qrCode} size={256} />
          </div>
          <p className="text-sm text-gray-500 text-center">
            Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect your WhatsApp number to start sending and receiving messages.
          </p>
          <div className="flex items-center space-x-4">
            <input
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Connect</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}