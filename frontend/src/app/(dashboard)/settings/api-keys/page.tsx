'use client';

import { useEffect, useState } from 'react';
import { apiKeysAPI, APIKey, APIKeyWithSecret } from '@/lib/api/api-keys';
import { Key, Plus, Trash2, Copy, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const AVAILABLE_SCOPES = [
  { value: 'messages:send', label: 'Send Messages', description: 'Send WhatsApp messages' },
  { value: 'messages:read', label: 'Read Messages', description: 'View message history' },
  { value: 'devices:read', label: 'Read Devices', description: 'View device information' },
  { value: 'devices:manage', label: 'Manage Devices', description: 'Control device connections' },
  { value: 'contacts:read', label: 'Read Contacts', description: 'View contact list' },
  { value: 'contacts:write', label: 'Write Contacts', description: 'Create/update contacts' },
  { value: 'webhooks:manage', label: 'Manage Webhooks', description: 'Configure webhooks' },
];

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState<APIKeyWithSecret | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      const response = await apiKeysAPI.getAll();
      setApiKeys(response.data.data);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: { name: string; scopes: string[]; environment: 'live' | 'test' }) => {
    try {
      const response = await apiKeysAPI.create(formData);
      setNewKeyData(response.data.data);
      setShowCreateModal(false);
      setShowKeyModal(true);
      await loadAPIKeys();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create API key');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiKeysAPI.delete(id);
      await loadAPIKeys();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete API key');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await apiKeysAPI.update(id, { is_active: !isActive });
      await loadAPIKeys();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-1">Manage API keys for external integrations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create API Key</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-900 font-medium">API Keys for External Integrations</p>
            <p className="text-sm text-blue-700 mt-1">
              Use these keys to integrate WhatsFlow with your accounting software, CRM, or custom applications.
              Keys are shown only once upon creation - store them securely.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {apiKeys.length === 0 ? (
          <div className="p-12 text-center">
            <Key className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No API keys yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Create your first API key to start integrating WhatsFlow
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create API Key
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          key.environment === 'live'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {key.environment.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          key.is_active
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>
                          <strong>Requests:</strong> {key.requests_count.toLocaleString()}
                        </span>
                        <span>
                          <strong>Last Used:</strong>{' '}
                          {key.last_used_at
                            ? new Date(key.last_used_at).toLocaleString()
                            : 'Never'}
                        </span>
                        <span>
                          <strong>Created:</strong>{' '}
                          {new Date(key.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <strong>Scopes:</strong>{' '}
                        <span className="inline-flex flex-wrap gap-1 ml-1">
                          {key.scopes.map((scope) => (
                            <span
                              key={scope}
                              className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                            >
                              {scope}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(key.id, key.is_active)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        key.is_active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {key.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(key.id, key.name)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <CreateAPIKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Show New Key Modal */}
      {showKeyModal && newKeyData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">API Key Created!</h2>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-900 font-medium mb-2">
                ⚠️ Important: Save this key now!
              </p>
              <p className="text-sm text-yellow-800">
                For security reasons, this is the only time you'll see this key. Copy it and store it securely.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newKeyData.key}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(newKeyData.key)}
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

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{newKeyData.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Environment</p>
                  <p className="font-medium text-gray-900">{newKeyData.environment.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowKeyModal(false);
                setNewKeyData(null);
              }}
              className="w-full mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              I've Saved the Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Create API Key Modal Component
function CreateAPIKeyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; scopes: string[]; environment: 'live' | 'test' }) => void;
}) {
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'live' | 'test'>('live');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'messages:send',
    'messages:read',
    'devices:read',
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({ name, scopes: selectedScopes, environment });
    } catch (error) {
      setSubmitting(false);
    }
  };

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create API Key</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production Integration, Accounting Software"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
            />
            <p className="text-sm text-gray-500 mt-1">
              A descriptive name to help you identify this key
            </p>
          </div>

          {/* Environment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="environment"
                  value="live"
                  checked={environment === 'live'}
                  onChange={() => setEnvironment('live')}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-900">Live (Production)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="environment"
                  value="test"
                  checked={environment === 'test'}
                  onChange={() => setEnvironment('test')}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-900">Test (Development)</span>
              </label>
            </div>
          </div>

          {/* Scopes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions (Scopes) *
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {AVAILABLE_SCOPES.map((scope) => (
                <label
                  key={scope.value}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope.value)}
                    onChange={() => toggleScope(scope.value)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{scope.label}</p>
                    <p className="text-sm text-gray-600">{scope.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {selectedScopes.length === 0 && (
              <p className="text-sm text-red-600 mt-2">Select at least one permission</p>
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
              disabled={submitting || !name || selectedScopes.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create API Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

