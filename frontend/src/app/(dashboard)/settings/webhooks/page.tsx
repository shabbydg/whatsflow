'use client';

import { useEffect, useState } from 'react';
import { webhooksAPI, Webhook, WebhookWithSecret, WebhookDelivery, AVAILABLE_EVENTS } from '@/lib/api/webhooks';
import { apiKeysAPI } from '@/lib/api/api-keys';
import { Globe, Plus, Trash2, Copy, CheckCircle, AlertCircle, Send, Eye, XCircle } from 'lucide-react';

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newWebhookData, setNewWebhookData] = useState<WebhookWithSecret | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const response = await apiKeysAPI.getAll();
      const keys = response.data.data;
      
      if (keys.length === 0) {
        setNeedsApiKey(true);
        setLoading(false);
        return;
      }

      // Find an active key with webhooks:manage scope
      const webhookKey = keys.find(
        (k) => k.is_active && k.scopes.includes('webhooks:manage')
      );

      if (!webhookKey) {
        setNeedsApiKey(true);
        setLoading(false);
        return;
      }

      // We can't actually get the plain key from the API
      // User needs to use their API key - let them input it
      setNeedsApiKey(true);
      setLoading(false);
    } catch (error) {
      console.error('Failed to check API keys:', error);
      setLoading(false);
    }
  };

  const loadWebhooks = async () => {
    if (!apiKey) return;
    
    try {
      setLoading(true);
      const response = await webhooksAPI.getAll(apiKey);
      setWebhooks(response.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('Invalid API key. Please check your API key and try again.');
        setApiKey('');
      } else {
        console.error('Failed to load webhooks:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async (webhookId: string) => {
    if (!apiKey) return;

    try {
      const response = await webhooksAPI.getDeliveries(apiKey, webhookId);
      setDeliveries(response.data.data);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    }
  };

  const handleCreate = async (formData: { url: string; events: string[]; description?: string }) => {
    if (!apiKey) return;

    try {
      const response = await webhooksAPI.create(apiKey, formData);
      setNewWebhookData(response.data.data);
      setShowCreateModal(false);
      setShowSecretModal(true);
      await loadWebhooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create webhook');
    }
  };

  const handleDelete = async (id: string) => {
    if (!apiKey || !confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      await webhooksAPI.delete(apiKey, id);
      await loadWebhooks();
      if (selectedWebhookId === id) {
        setSelectedWebhookId(null);
        setDeliveries([]);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete webhook');
    }
  };

  const handleTest = async (id: string) => {
    if (!apiKey) return;

    try {
      await webhooksAPI.test(apiKey, id);
      alert('Test webhook queued! Check the deliveries tab shortly.');
      setTimeout(() => loadDeliveries(id), 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to test webhook');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    if (!apiKey) return;

    try {
      await webhooksAPI.update(apiKey, id, { is_active: !isActive });
      await loadWebhooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update webhook');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (needsApiKey && !apiKey) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600 mt-1">Receive real-time events from WhatsFlow</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center max-w-md mx-auto">
            <Key className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">API Key Required</h2>
            <p className="text-gray-600 mb-6">
              To manage webhooks, you need an API key with the <code className="bg-gray-100 px-2 py-1 rounded text-sm">webhooks:manage</code> scope.
            </p>

            <div className="text-left space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="wf_live_..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                />
              </div>
              <button
                onClick={() => {
                  if (apiKey) {
                    loadWebhooks();
                  }
                }}
                disabled={!apiKey}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Don't have an API key?{' '}
              <a href="/settings/api-keys" className="text-purple-600 hover:text-purple-700 font-medium">
                Create one here
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600 mt-1">Receive real-time events from WhatsFlow</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Webhook</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webhooks List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Webhooks</h2>
          </div>

          {webhooks.length === 0 ? (
            <div className="p-8 text-center">
              <Globe className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2">No webhooks configured</p>
              <p className="text-sm text-gray-500">
                Create a webhook to receive real-time events
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedWebhookId === webhook.id ? 'bg-purple-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedWebhookId(webhook.id);
                    loadDeliveries(webhook.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900 truncate">{webhook.url}</p>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            webhook.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {webhook.description && (
                        <p className="text-sm text-gray-600">{webhook.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-3">
                      <span className="text-green-600">✓ {webhook.success_count}</span>
                      <span className="text-red-600">✗ {webhook.failure_count}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTest(webhook.id);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Test webhook"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(webhook.id, webhook.is_active);
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title={webhook.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {webhook.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(webhook.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Deliveries</h2>
          </div>

          {!selectedWebhookId ? (
            <div className="p-8 text-center">
              <Eye className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">Select a webhook to view delivery logs</p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No deliveries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {delivery.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{delivery.event_type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(delivery.delivered_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          delivery.success ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {delivery.response_status || 'No response'}
                      </p>
                      <p className="text-xs text-gray-500">Attempt {delivery.attempt_number}</p>
                    </div>
                  </div>

                  {delivery.error_message && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                      {delivery.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <CreateWebhookModal
          apiKey={apiKey}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Show Webhook Secret Modal */}
      {showSecretModal && newWebhookData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Webhook Created!</h2>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-900 font-medium mb-2">
                ⚠️ Save this secret now!
              </p>
              <p className="text-sm text-yellow-800">
                Use this secret to verify webhook signatures. It will not be shown again.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Secret
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newWebhookData.secret}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(newWebhookData.secret)}
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">Signature Verification</p>
                <p className="text-sm text-blue-700">
                  Webhook payloads include an <code className="bg-blue-100 px-1 rounded">X-Webhook-Signature</code> header.
                  Verify it using HMAC-SHA256 with this secret.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSecretModal(false);
                setNewWebhookData(null);
              }}
              className="w-full mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              I've Saved the Secret
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Create Webhook Modal Component
function CreateWebhookModal({
  apiKey,
  onClose,
  onCreate,
}: {
  apiKey: string;
  onClose: () => void;
  onCreate: (data: { url: string; events: string[]; description?: string }) => void;
}) {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['message.received']);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({ url, events: selectedEvents, description });
    } catch (error) {
      setSubmitting(false);
    }
  };

  const toggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Webhook</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-domain.com/webhooks/whatsflow"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
            />
            <p className="text-sm text-gray-500 mt-1">
              The endpoint that will receive webhook events
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Production webhook, CRM integration"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Events */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Subscribe to Events *
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {AVAILABLE_EVENTS.map((event) => (
                <label
                  key={event.value}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.value)}
                    onChange={() => toggleEvent(event.value)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.label}</p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {selectedEvents.length === 0 && (
              <p className="text-sm text-red-600 mt-2">Select at least one event</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !url || selectedEvents.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Key({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}

function EyeOff({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

