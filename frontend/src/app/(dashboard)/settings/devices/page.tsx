'use client';

import { useEffect, useState } from 'react';
import { devicesAPI, personasAPI } from '@/lib/api';
import { Device, Persona } from '@/types';
import { Smartphone, Plus, Settings, Trash2, Star, QrCode, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { socket } from '@/lib/socket';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null); // Device ID being generated

  useEffect(() => {
    loadData();

    // Connect to Socket.IO
    socket.connect();

    // Get business profile ID from user token/context (you may need to get this from auth context)
    // For now, we'll emit join event without explicit businessProfileId since backend should handle it from auth
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.businessProfileId) {
      socket.emit('join-business', user.businessProfileId);
    }

    // Listen for WhatsApp connection events
    const handleWhatsAppConnected = (data: any) => {
      console.log('WhatsApp device connected:', data);
      // Reload devices to update status and remove QR code
      loadData();
      // Clear generating state if this was the device being connected
      setGeneratingQR(null);
    };

    socket.on('whatsapp-connected', handleWhatsAppConnected);

    // Cleanup
    return () => {
      socket.off('whatsapp-connected', handleWhatsAppConnected);
    };
  }, []);

  const loadData = async () => {
    try {
      const [devicesRes, personasRes] = await Promise.all([
        devicesAPI.getAll(),
        personasAPI.getAll(),
      ]);
      setDevices(devicesRes.data.data);
      setPersonas(personasRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (device: Device) => {
    if (!confirm(`Are you sure you want to delete "${device.device_name}"?`)) return;

    try {
      await devicesAPI.delete(device.id);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete device');
    }
  };

  const handleReconnect = async (device: Device) => {
    try {
      setGeneratingQR(device.id);
      await devicesAPI.reconnect(device.id);

      // Poll for QR code (it takes a few seconds to generate)
      let attempts = 0;
      const maxAttempts = 10; // 10 seconds max

      const pollQRCode = async () => {
        attempts++;
        await loadData();

        // Check if device has QR code now
        const devicesRes = await devicesAPI.getAll();
        const updatedDevice = devicesRes.data.data.find((d: Device) => d.id === device.id);

        if (updatedDevice?.qr_code || attempts >= maxAttempts) {
          // Stop polling
          setGeneratingQR(null);
          return;
        }

        // Continue polling
        setTimeout(pollQRCode, 1000);
      };

      // Start polling after initial delay
      setTimeout(pollQRCode, 1000);
    } catch (error: any) {
      setGeneratingQR(null);
      alert(error.response?.data?.error || 'Failed to reconnect device');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600 mt-1">Manage your WhatsApp connections</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Device</span>
        </button>
      </div>

      {/* Devices List */}
      <div className="grid gap-4">
        {devices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Smartphone className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No devices configured yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Your First Device
            </button>
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-purple-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {device.device_name}
                      </h3>
                      {device.is_primary && (
                        <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          <Star className="w-3 h-3" />
                          <span>Primary</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Phone:</span>
                        <span>{device.phone_number}</span>
                      </div>
                      {device.persona_name && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Persona:</span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                            {device.persona_name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Status:</span>
                        <span className="flex items-center space-x-1">
                          {device.status === 'connected' ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-green-600">Connected</span>
                            </>
                          ) : device.status === 'qr_pending' ? (
                            <>
                              <QrCode className="w-4 h-4 text-yellow-500" />
                              <span className="text-yellow-600">Waiting for QR Scan</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-600">Disconnected</span>
                            </>
                          )}
                        </span>
                      </div>
                      {device.auto_reply_enabled && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Auto-Reply:</span>
                          <span className="flex items-center space-x-1 text-green-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {device.working_hours_start} - {device.working_hours_end}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* QR Code Display */}
                    {device.status === 'qr_pending' && device.qr_code && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-900 mb-2">
                          Scan this QR code with WhatsApp
                        </p>
                        <img
                          src={device.qr_code}
                          alt="QR Code"
                          className="w-48 h-48 bg-white p-2 rounded"
                        />
                        <button
                          onClick={() => handleReconnect(device)}
                          className="mt-3 px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Refresh QR Code</span>
                        </button>
                      </div>
                    )}

                    {/* Show connect button for qr_pending devices without QR code */}
                    {device.status === 'qr_pending' && !device.qr_code && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleReconnect(device)}
                          disabled={generatingQR === device.id}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingQR === device.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              <span>Generating QR Code...</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="w-4 h-4" />
                              <span>Generate QR Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Show reconnect button for disconnected devices */}
                    {device.status === 'disconnected' && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleReconnect(device)}
                          disabled={generatingQR === device.id}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingQR === device.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              <span>Reconnecting...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              <span>Reconnect Device</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedDevice(device);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(device)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <AddDeviceModal
          personas={personas}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}

      {/* Edit Device Modal */}
      {showEditModal && selectedDevice && (
        <EditDeviceModal
          device={selectedDevice}
          personas={personas}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDevice(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedDevice(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Add Device Modal Component
function AddDeviceModal({
  personas,
  onClose,
  onSuccess,
}: {
  personas: Persona[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    device_name: '',
    phone_number: '',
    persona_id: personas.find((p) => p.name === 'General')?.id || '',
    auto_reply_enabled: false,
    ai_schedule: [] as any[],
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    working_days: 'Mon,Tue,Wed,Thu,Fri',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await devicesAPI.create(formData);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create device');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Device</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Name *
              </label>
              <input
                type="text"
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                placeholder="e.g., Sales Line, Support Hotline"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+1234567890"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              <p className="text-sm text-gray-500 mt-1">Include country code</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Persona
              </label>
              <select
                value={formData.persona_id}
                onChange={(e) => setFormData({ ...formData, persona_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
              >
                <option value="">No Persona</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name} {persona.is_system ? '(System)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_reply"
                checked={formData.auto_reply_enabled}
                onChange={(e) => setFormData({ ...formData, auto_reply_enabled: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="auto_reply" className="text-sm font-medium text-gray-700">
                Enable AI Auto-Reply
              </label>
            </div>

            {formData.auto_reply_enabled && (
              <div className="space-y-3 pl-6 border-l-2 border-purple-200">
                <p className="text-sm text-gray-600">AI will respond during these time ranges (leave empty for 24/7):</p>
                {formData.ai_schedule && formData.ai_schedule.length > 0 ? (
                  formData.ai_schedule.map((schedule: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={schedule.from}
                        onChange={(e) => {
                          const newSchedule = [...formData.ai_schedule];
                          newSchedule[index].from = e.target.value;
                          setFormData({ ...formData, ai_schedule: newSchedule });
                        }}
                        className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      />
                      <span className="text-sm text-gray-600">to</span>
                      <input
                        type="time"
                        value={schedule.to}
                        onChange={(e) => {
                          const newSchedule = [...formData.ai_schedule];
                          newSchedule[index].to = e.target.value;
                          setFormData({ ...formData, ai_schedule: newSchedule });
                        }}
                        className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSchedule = formData.ai_schedule.filter((_: any, i: number) => i !== index);
                          setFormData({ ...formData, ai_schedule: newSchedule });
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No time ranges set - AI will respond 24/7</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const currentSchedule = formData.ai_schedule || [];
                    setFormData({
                      ...formData,
                      ai_schedule: [...currentSchedule, { from: '09:00', to: '17:00' }],
                    });
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  + Add Time Range
                </button>
              </div>
            )}

            <div style={{display: 'none'}}>
              <input
                type="text"
                value={formData.working_days}
                onChange={(e) => setFormData({ ...formData, working_days: e.target.value })}
                placeholder="Mon,Tue,Wed,Thu,Fri"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              <p className="text-sm text-gray-500 mt-1">Comma-separated days</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Device'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Device Modal Component (similar structure, implementation truncated for brevity)
function EditDeviceModal({
  device,
  personas,
  onClose,
  onSuccess,
}: {
  device: Device;
  personas: Persona[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<{
    device_name: string;
    persona_id: string;
    auto_reply_enabled: boolean;
    ai_enabled: boolean;
    ai_schedule: any[];
    working_hours_start: string;
    working_hours_end: string;
    working_days: string;
    is_primary: boolean;
  }>({
    device_name: device.device_name,
    persona_id: device.persona_id || '',
    auto_reply_enabled: device.auto_reply_enabled,
    ai_enabled: device.ai_enabled !== undefined ? device.ai_enabled : true,
    ai_schedule: (() => {
      if (!device.ai_schedule) return [];
      if (typeof device.ai_schedule === 'string') {
        try {
          return JSON.parse(device.ai_schedule);
        } catch {
          return [];
        }
      }
      return Array.isArray(device.ai_schedule) ? device.ai_schedule : [];
    })(),
    working_hours_start: device.working_hours_start || '09:00',
    working_hours_end: device.working_hours_end || '17:00',
    working_days: device.working_days || 'Mon,Tue,Wed,Thu,Fri',
    is_primary: device.is_primary,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await devicesAPI.update(device.id, formData);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update device');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Device</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Name
              </label>
              <input
                type="text"
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Persona
              </label>
              <select
                value={formData.persona_id}
                onChange={(e) => setFormData({ ...formData, persona_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
              >
                <option value="">No Persona</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name} {persona.is_system ? '(System)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_primary" className="text-sm font-medium text-gray-700">
                Set as Primary Device
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_ai_enabled"
                checked={formData.ai_enabled}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setFormData({
                    ...formData,
                    ai_enabled: newValue,
                    auto_reply_enabled: newValue // Sync both toggles
                  });
                }}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="edit_ai_enabled" className="text-sm font-medium text-gray-700">
                Enable AI Auto-Reply
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="email_on_disconnect"
                checked={formData.email_on_disconnect || false}
                onChange={(e) => setFormData({ ...formData, email_on_disconnect: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="email_on_disconnect" className="text-sm font-medium text-gray-700">
                Email Alert on Disconnect
              </label>
            </div>

            {formData.ai_enabled && (
              <div className="space-y-3 pl-6 border-l-2 border-purple-200">
                <p className="text-sm text-gray-600">AI will respond during these time ranges (leave empty for 24/7):</p>
                {formData.ai_schedule.map((schedule, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={schedule.from}
                      onChange={(e) => {
                        const newSchedule = [...formData.ai_schedule];
                        newSchedule[index].from = e.target.value;
                        setFormData({ ...formData, ai_schedule: newSchedule });
                      }}
                      className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900"
                    />
                    <span className="text-sm text-gray-600">to</span>
                    <input
                      type="time"
                      value={schedule.to}
                      onChange={(e) => {
                        const newSchedule = [...formData.ai_schedule];
                        newSchedule[index].to = e.target.value;
                        setFormData({ ...formData, ai_schedule: newSchedule });
                      }}
                      className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSchedule = formData.ai_schedule.filter((_, i) => i !== index);
                        setFormData({ ...formData, ai_schedule: newSchedule });
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      ai_schedule: [...formData.ai_schedule, { from: '09:00', to: '17:00' }],
                    });
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  + Add Time Range
                </button>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
