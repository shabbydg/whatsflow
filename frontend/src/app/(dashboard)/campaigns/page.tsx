'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { broadcastsApi } from '@/lib/api/broadcasts';
import type { Broadcast } from '@/types';

export default function CampaignsPage() {
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [guidelinesAcknowledged, setGuidelinesAcknowledged] = useState(false);

  useEffect(() => {
    checkGuidelinesStatus();
    loadBroadcasts();
  }, [statusFilter]);

  const checkGuidelinesStatus = async () => {
    try {
      const status = await broadcastsApi.getGuidelinesStatus();
      setGuidelinesAcknowledged(status.acknowledged);
    } catch (error) {
      console.error('Failed to check guidelines status:', error);
    }
  };

  const loadBroadcasts = async () => {
    try {
      const options = statusFilter !== 'all' ? { status: statusFilter } : {};
      const result = await broadcastsApi.getAll(options);
      setBroadcasts(result.broadcasts);
    } catch (error) {
      console.error('Failed to load broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBroadcast = () => {
    if (!guidelinesAcknowledged) {
      setShowGuidelinesModal(true);
    } else {
      router.push('/campaigns/create');
    }
  };

  const handleAcknowledgeGuidelines = async () => {
    try {
      await broadcastsApi.acknowledgeGuidelines();
      setGuidelinesAcknowledged(true);
      setShowGuidelinesModal(false);
      router.push('/campaigns/create');
    } catch (error) {
      console.error('Failed to acknowledge guidelines:', error);
    }
  };

  const handleDeleteBroadcast = async (broadcastId: string) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;

    try {
      await broadcastsApi.delete(broadcastId);
      loadBroadcasts();
    } catch (error) {
      console.error('Failed to delete broadcast:', error);
      alert('Failed to delete broadcast. It may be currently sending.');
    }
  };

  const handleCancelBroadcast = async (broadcastId: string) => {
    if (!confirm('Are you sure you want to cancel this broadcast?')) return;

    try {
      await broadcastsApi.cancel(broadcastId);
      loadBroadcasts();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressPercentage = (broadcast: Broadcast) => {
    if (broadcast.total_recipients === 0) return 0;
    return Math.round((broadcast.sent_count / broadcast.total_recipients) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcast Campaigns</h1>
          <p className="text-sm text-gray-600 mt-1">Send messages to multiple contacts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/campaigns/lists')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Manage Lists
          </button>
          <button
            onClick={handleCreateBroadcast}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + New Broadcast
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Broadcasts List */}
      <div className="space-y-4">
        {broadcasts.map((broadcast) => (
          <div
            key={broadcast.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{broadcast.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      broadcast.status
                    )}`}
                  >
                    {broadcast.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{broadcast.message_content}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{broadcast.total_recipients}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{broadcast.sent_count}</p>
                <p className="text-xs text-gray-600">Sent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{broadcast.delivered_count}</p>
                <p className="text-xs text-gray-600">Delivered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{broadcast.failed_count}</p>
                <p className="text-xs text-gray-600">Failed</p>
              </div>
            </div>

            {/* Progress Bar */}
            {broadcast.status === 'sending' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">
                    {getProgressPercentage(broadcast)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(broadcast)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>Created: {formatDate(broadcast.created_at)}</span>
              {broadcast.scheduled_at && (
                <span>Scheduled: {formatDate(broadcast.scheduled_at)}</span>
              )}
              {broadcast.completed_at && (
                <span>Completed: {formatDate(broadcast.completed_at)}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/campaigns/${broadcast.id}`)}
                className="flex-1 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              >
                View Details
              </button>

              {broadcast.status === 'draft' && (
                <>
                  <button
                    onClick={() => router.push(`/campaigns/create?edit=${broadcast.id}`)}
                    className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBroadcast(broadcast.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}

              {(broadcast.status === 'sending' || broadcast.status === 'scheduled') && (
                <button
                  onClick={() => handleCancelBroadcast(broadcast.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}

        {broadcasts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-gray-500 mb-4">No broadcasts found</p>
            <button
              onClick={handleCreateBroadcast}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Your First Broadcast
            </button>
          </div>
        )}
      </div>

      {/* Guidelines Modal */}
      {showGuidelinesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              ⚠️ WhatsApp Broadcast Guidelines
            </h2>

            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please read and acknowledge these guidelines before
                  sending broadcasts. Violating WhatsApp's Terms of Service may result in your
                  account being banned.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Rate Limiting</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Slow: 30 seconds between messages (120 messages/hour)</li>
                  <li>Normal: 20 seconds between messages (180 messages/hour)</li>
                  <li>Fast: 10 seconds between messages (360 messages/hour)</li>
                  <li>Maximum 1000 recipients per broadcast</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Content Guidelines</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Only message contacts who have opted in</li>
                  <li>Do not send spam or unsolicited messages</li>
                  <li>Include your business name and contact info</li>
                  <li>Provide a clear way for recipients to opt-out</li>
                  <li>Do not send misleading or deceptive content</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Best Practices</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Test your message with a small group first</li>
                  <li>Personalize messages when possible</li>
                  <li>Send messages during appropriate hours</li>
                  <li>Monitor delivery rates and adjust accordingly</li>
                  <li>Honor opt-out requests immediately</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-red-600">Consequences</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Violating WhatsApp Business ToS may result in account suspension</li>
                  <li>Your phone number may be blocked by WhatsApp</li>
                  <li>Recipients may report your messages as spam</li>
                  <li>Use this feature responsibly</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
              <input
                type="checkbox"
                id="acknowledge"
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="acknowledge" className="text-sm text-gray-700">
                I have read and understand these guidelines. I agree to use the broadcast feature
                responsibly and in compliance with WhatsApp's Terms of Service.
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowGuidelinesModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledgeGuidelines}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                I Acknowledge & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
