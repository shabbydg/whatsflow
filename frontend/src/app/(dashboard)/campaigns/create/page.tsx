'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { broadcastsApi, contactListsApi } from '@/lib/api/broadcasts';
import axios from 'axios';

// Create axios instance
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
import type {
  ContactList,
  Device,
  CreateBroadcastData,
  MessageType,
  SendSpeed,
} from '@/types';

export default function CreateBroadcastPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);

  // Form data
  const [formData, setFormData] = useState<{
    name: string;
    device_id: string;
    contact_list_ids: string[];
    message_content: string;
    message_type: MessageType;
    media_url: string;
    send_speed: SendSpeed;
    custom_delay: number;
    scheduled_at: string;
  }>({
    name: '',
    device_id: '',
    contact_list_ids: [],
    message_content: '',
    message_type: 'text',
    media_url: '',
    send_speed: 'normal',
    custom_delay: 20,
    scheduled_at: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load devices
      const devicesResponse = await api.get<{ success: boolean; data: Device[] }>('/devices');
      const connectedDevices = devicesResponse.data.data.filter((d) => d.status === 'connected');
      setDevices(connectedDevices);

      // Load contact lists
      const lists = await contactListsApi.getAll();
      setContactLists(lists);

      // If editing, load broadcast data
      if (editId) {
        const broadcast = await broadcastsApi.getById(editId);
        setFormData({
          name: broadcast.name,
          device_id: broadcast.device_id,
          contact_list_ids: [], // Would need to fetch from junction table
          message_content: broadcast.message_content,
          message_type: broadcast.message_type,
          media_url: broadcast.media_url || '',
          send_speed: broadcast.send_speed,
          custom_delay: broadcast.custom_delay || 20,
          scheduled_at: broadcast.scheduled_at || '',
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const getTotalRecipients = () => {
    return contactLists
      .filter((list) => formData.contact_list_ids.includes(list.id))
      .reduce((sum, list) => sum + list.total_contacts, 0);
  };

  const getDelayDescription = (speed: SendSpeed, customDelay?: number) => {
    switch (speed) {
      case 'slow':
        return '30 seconds (120 msg/hour)';
      case 'normal':
        return '20 seconds (180 msg/hour)';
      case 'fast':
        return '10 seconds (360 msg/hour)';
      case 'custom':
        return `${customDelay || 20} seconds`;
      default:
        return '';
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: CreateBroadcastData = {
        name: formData.name,
        device_id: formData.device_id,
        message_content: formData.message_content,
        message_type: formData.message_type,
        media_url: formData.media_url || undefined,
        send_speed: formData.send_speed,
        custom_delay: formData.send_speed === 'custom' ? formData.custom_delay : undefined,
        scheduled_at: formData.scheduled_at || undefined,
        contact_list_ids: formData.contact_list_ids,
      };

      const broadcast = await broadcastsApi.create(data);

      // Ask if user wants to send now
      const sendNow = confirm(
        'Broadcast created successfully! Do you want to start sending now?'
      );

      if (sendNow) {
        await broadcastsApi.send(broadcast.id);
        alert('Broadcast started successfully!');
      }

      router.push('/campaigns');
    } catch (error: any) {
      console.error('Failed to create broadcast:', error);
      alert(error.response?.data?.error || 'Failed to create broadcast');
    } finally {
      setLoading(false);
    }
  };

  const previewPersonalization = () => {
    let preview = formData.message_content;
    preview = preview.replace(/\[full_name\]/g, 'John Doe');
    preview = preview.replace(/\[phone\]/g, '+94771234567');
    preview = preview.replace(/\[phone_number\]/g, '+94771234567');
    return preview;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {editId ? 'Edit Broadcast' : 'Create New Broadcast'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Follow the steps to create your broadcast campaign
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Details' },
          { num: 2, label: 'Message' },
          { num: 3, label: 'Send Options' },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s.num
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s.num}
              </div>
              <span className="text-sm mt-2 text-gray-700">{s.label}</span>
            </div>
            {idx < 2 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  step > s.num ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Step 1: Broadcast Details */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Broadcast Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Broadcast Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="e.g., Holiday Sale Announcement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Device *
              </label>
              <select
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Choose a device...</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.device_name} ({device.phone_number})
                  </option>
                ))}
              </select>
              {devices.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No connected devices available. Please connect a device first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Contact Lists *
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {contactLists.map((list) => (
                  <label
                    key={list.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.contact_list_ids.includes(list.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            contact_list_ids: [...formData.contact_list_ids, list.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            contact_list_ids: formData.contact_list_ids.filter(
                              (id) => id !== list.id
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{list.name}</p>
                      <p className="text-sm text-gray-600">{list.total_contacts} contacts</p>
                    </div>
                  </label>
                ))}
                {contactLists.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No contact lists available.{' '}
                    <button
                      onClick={() => router.push('/campaigns/lists')}
                      className="text-purple-600 hover:underline"
                    >
                      Create one now
                    </button>
                  </p>
                )}
              </div>
            </div>

            {formData.contact_list_ids.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900">
                  <strong>Total Recipients:</strong> {getTotalRecipients()} contacts
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Message Content */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Message Content</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Type
              </label>
              <div className="flex gap-4">
                {(['text', 'image', 'file'] as MessageType[]).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="message_type"
                      value={type}
                      checked={formData.message_type === type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          message_type: e.target.value as MessageType,
                        })
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {(formData.message_type === 'image' || formData.message_type === 'file') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media URL
                </label>
                <input
                  type="text"
                  value={formData.media_url}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content *
              </label>
              <textarea
                value={formData.message_content}
                onChange={(e) =>
                  setFormData({ ...formData, message_content: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                rows={8}
                placeholder="Type your message here..."
              />
              <div className="mt-2 text-sm text-gray-600">
                <p className="mb-1">Available personalization fields:</p>
                <div className="flex gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">[full_name]</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">[phone]</code>
                </div>
              </div>
            </div>

            {formData.message_content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Preview
                </label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {previewPersonalization()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Send Options */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Sending Options</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Speed
              </label>
              <div className="space-y-3">
                {(['slow', 'normal', 'fast', 'custom'] as SendSpeed[]).map((speed) => (
                  <label
                    key={speed}
                    className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="send_speed"
                      value={speed}
                      checked={formData.send_speed === speed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          send_speed: e.target.value as SendSpeed,
                        })
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">{speed}</p>
                      <p className="text-sm text-gray-600">
                        {getDelayDescription(speed, formData.custom_delay)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {formData.send_speed === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Delay (seconds)
                </label>
                <input
                  type="number"
                  value={formData.custom_delay}
                  onChange={(e) =>
                    setFormData({ ...formData, custom_delay: parseInt(e.target.value) })
                  }
                  min={5}
                  max={120}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When to Send
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="send_time"
                    checked={!formData.scheduled_at}
                    onChange={() => setFormData({ ...formData, scheduled_at: '' })}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Send Immediately</p>
                    <p className="text-sm text-gray-600">Start sending after creation</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="send_time"
                    checked={!!formData.scheduled_at}
                    onChange={() => {
                      const now = new Date();
                      now.setHours(now.getHours() + 1);
                      setFormData({
                        ...formData,
                        scheduled_at: now.toISOString().slice(0, 16),
                      });
                    }}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Schedule for Later</p>
                    <p className="text-sm text-gray-600 mb-2">Choose a specific date and time</p>
                    {formData.scheduled_at && (
                      <input
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) =>
                          setFormData({ ...formData, scheduled_at: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Review Summary</h3>
              <div className="space-y-1 text-sm text-purple-800">
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>
                <p>
                  <strong>Recipients:</strong> {getTotalRecipients()} contacts
                </p>
                <p>
                  <strong>Send Speed:</strong> {getDelayDescription(formData.send_speed, formData.custom_delay)}
                </p>
                <p>
                  <strong>When:</strong>{' '}
                  {formData.scheduled_at
                    ? new Date(formData.scheduled_at).toLocaleString()
                    : 'Immediately'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
          )}

          <button
            onClick={() => router.push('/campaigns')}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>

          <div className="flex-1"></div>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 &&
                  (!formData.name ||
                    !formData.device_id ||
                    formData.contact_list_ids.length === 0)) ||
                (step === 2 && !formData.message_content)
              }
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Broadcast'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
