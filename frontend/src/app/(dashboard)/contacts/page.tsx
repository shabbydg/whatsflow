'use client';

import { useEffect, useState } from 'react';
import { contactsAPI, whatsappAPI } from '@/lib/api';
import { Contact, Tag } from '@/types';
import { Search, UserPlus, Tag as TagIcon, Phone, Mail, RefreshCw, Target } from 'lucide-react';
import { formatDate, formatPhone } from '@/lib/utils';
import Link from 'next/link';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactName, setNewContactName] = useState('');

  useEffect(() => {
    loadContacts();
    loadTags();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getAll();
      setContacts(response.data.data.contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await contactsAPI.getTags();
      setTags(response.data.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      loadContacts();
      return;
    }

    try {
      const response = await contactsAPI.search(query);
      setContacts(response.data.data);
    } catch (error) {
      console.error('Error searching contacts:', error);
    }
  };

  const handleSyncContacts = async () => {
    setSyncing(true);
    try {
      const response = await whatsappAPI.syncContacts();
      const message = response.data.data.message || `Synced ${response.data.data.synced} contacts (${response.data.data.new} new)`;
      alert(message);
      await loadContacts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to sync contacts');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contactsAPI.create(newContactPhone, newContactName);
      setShowAddContact(false);
      setNewContactPhone('');
      setNewContactName('');
      await loadContacts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add contact');
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
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your WhatsApp contacts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/leads"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Target className="w-4 h-4" />
            <span>View Leads</span>
          </Link>
          <button
            onClick={handleSyncContacts}
            disabled={syncing}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync from WhatsApp'}</span>
          </button>
          <button
            onClick={() => setShowAddContact(true)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {contacts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No contacts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {contact.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {contact.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.total_messages}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {contact.last_message_at
                          ? formatDate(contact.last_message_at)
                          : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`/messages?contact=${contact.id}`}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Message
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{contacts.length}</p>
            </div>
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tags</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{tags.length}</p>
            </div>
            <TagIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Conversations</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {contacts.filter((c) => c.total_messages > 0).length}
              </p>
            </div>
            <Mail className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Contact</h2>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+1234567890"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <p className="text-sm text-gray-500 mt-1">Include country code</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Contact Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Contact
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
