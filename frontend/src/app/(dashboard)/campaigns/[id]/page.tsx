'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { broadcastsApi } from '@/lib/api/broadcasts';
import type { Broadcast, BroadcastStats, BroadcastRecipient } from '@/types';

export default function BroadcastDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const broadcastId = params.id as string;

  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [stats, setStats] = useState<BroadcastStats | null>(null);
  const [recipients, setRecipients] = useState<BroadcastRecipient[]>([]);
  const [recipientsTotal, setRecipientsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recipientStatusFilter, setRecipientStatusFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadBroadcastData();

    // Auto-refresh every 5 seconds if broadcast is sending
    const interval = setInterval(() => {
      if (autoRefresh && broadcast?.status === 'sending') {
        loadBroadcastData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [broadcastId, recipientStatusFilter, autoRefresh, broadcast?.status]);

  const loadBroadcastData = async () => {
    try {
      const [broadcastData, statsData, recipientsData] = await Promise.all([
        broadcastsApi.getById(broadcastId),
        broadcastsApi.getProgress(broadcastId),
        broadcastsApi.getRecipients(broadcastId, {
          status: recipientStatusFilter !== 'all' ? recipientStatusFilter : undefined,
          limit: 100,
        }),
      ]);

      setBroadcast(broadcastData);
      setStats(statsData);
      setRecipients(recipientsData.recipients);
      setRecipientsTotal(recipientsData.total);
    } catch (error) {
      console.error('Failed to load broadcast data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this broadcast?')) return;

    try {
      await broadcastsApi.cancel(broadcastId);
      loadBroadcastData();
    } catch (error) {
      console.error('Failed to cancel broadcast:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'sending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRecipientStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'queued':
        return 'text-gray-600';
      case 'sending':
        return 'text-yellow-600';
      case 'sent':
        return 'text-blue-600';
      case 'delivered':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'skipped':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressPercentage = () => {
    if (!broadcast || broadcast.total_recipients === 0) return 0;
    return Math.round((broadcast.sent_count / broadcast.total_recipients) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!broadcast) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Broadcast not found</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <button
            onClick={() => router.push('/campaigns')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back to Campaigns
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{broadcast.name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                broadcast.status
              )}`}
            >
              {broadcast.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Created: {formatDate(broadcast.created_at)}</p>
        </div>

        <div className="flex gap-2">
          {broadcast.status === 'sending' && (
            <>
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm">Auto-refresh</span>
              </label>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                Cancel Broadcast
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-1">Total Recipients</p>
          <p className="text-3xl font-bold text-gray-900">{broadcast.total_recipients}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-1">Sent</p>
          <p className="text-3xl font-bold text-green-600">{broadcast.sent_count}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats && Math.round((stats.sent / stats.total) * 100)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-1">Delivered</p>
          <p className="text-3xl font-bold text-blue-600">{broadcast.delivered_count}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats && Math.round((stats.delivered / stats.total) * 100)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-600">{broadcast.failed_count}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats && Math.round((stats.failed / stats.total) * 100)}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {broadcast.status === 'sending' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">Sending Progress</h3>
            <span className="text-sm font-medium text-gray-900">{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {broadcast.sent_count} of {broadcast.total_recipients} messages sent
          </p>
        </div>
      )}

      {/* Message Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Message Content</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{broadcast.message_content}</p>
        </div>
        <div className="mt-3 flex gap-4 text-sm text-gray-600">
          <span>
            <strong>Type:</strong> {broadcast.message_type}
          </span>
          <span>
            <strong>Speed:</strong> {broadcast.send_speed}
          </span>
          {broadcast.scheduled_at && (
            <span>
              <strong>Scheduled:</strong> {formatDate(broadcast.scheduled_at)}
            </span>
          )}
        </div>
      </div>

      {/* Recipients List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recipients ({recipientsTotal})</h3>

          {/* Status Filter */}
          <select
            value={recipientStatusFilter}
            onChange={(e) => setRecipientStatusFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="queued">Queued</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>

        {/* Detailed Stats */}
        {stats && (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4 text-center text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Pending</p>
              <p className="font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Queued</p>
              <p className="font-bold text-gray-900">{stats.queued}</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <p className="text-yellow-600">Sending</p>
              <p className="font-bold text-yellow-900">{stats.sending}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-blue-600">Sent</p>
              <p className="font-bold text-blue-900">{stats.sent}</p>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <p className="text-green-600">Delivered</p>
              <p className="font-bold text-green-900">{stats.delivered}</p>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <p className="text-red-600">Failed</p>
              <p className="font-bold text-red-900">{stats.failed}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Skipped</p>
              <p className="font-bold text-gray-900">{stats.skipped}</p>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <p className="text-purple-600">Total</p>
              <p className="font-bold text-purple-900">{stats.total}</p>
            </div>
          </div>
        )}

        {/* Recipients Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Sent At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recipients.map((recipient) => (
                <tr key={recipient.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {recipient.full_name || 'Unnamed Contact'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{recipient.phone_number}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${getRecipientStatusColor(
                        recipient.status
                      )}`}
                    >
                      {recipient.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {recipient.sent_at ? formatDate(recipient.sent_at) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recipients.length === 0 && (
            <p className="text-center text-gray-500 py-8">No recipients found</p>
          )}
        </div>
      </div>
    </div>
  );
}
