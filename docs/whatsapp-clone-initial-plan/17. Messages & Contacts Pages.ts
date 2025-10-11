// FILE: src/app/(dashboard)/contacts/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { contactsAPI } from '@/lib/api';
import { Contact, Tag } from '@/types';
import { Search, UserPlus, Tag as TagIcon, Phone } from 'lucide-react';
import { formatDate, formatPhone } from '@/lib/utils';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your WhatsApp contacts</p>
        </div>
        <button
          onClick={() => setShowAddContact(true)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No contacts found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {contacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onSuccess={() => {
            setShowAddContact(false);
            loadContacts();
          }}
        />
      )}
    </div>
  );
}

function ContactRow({ contact }: { contact: Contact }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-semibold text-lg">
              {contact.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <Phone className="w-3 h-3" />
              <span>{formatPhone(contact.phone_number)}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">{contact.total_messages} messages</p>
            {contact.last_message_at && (
              <p className="text-xs text-gray-500">{formatDate(contact.last_message_at)}</p>
            )}
          </div>
          <a
            href={`/messages?contact=${contact.id}`}
            className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50"
          >
            View Chat
          </a>
        </div>
      </div>
    </div>
  );
}

function AddContactModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactsAPI.create(phoneNumber, name);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Add Contact</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="+1234567890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================

// FILE: src/app/(dashboard)/messages/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { contactsAPI, messagesAPI, whatsappAPI } from '@/lib/api';
import { Contact, Message } from '@/types';
import { Send, Phone, Search } from 'lucide-react';
import { formatDate, formatPhone } from '@/lib/utils';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get('contact');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (contactId) {
      loadContactAndMessages(contactId);
    }
  }, [contactId]);

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getAll();
      setContacts(response.data.data.contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadContactAndMessages = async (id: string) => {
    setLoading(true);
    try {
      const [contactRes, messagesRes] = await Promise.all([
        contactsAPI.getById(id),
        messagesAPI.getConversation(id),
      ]);
      
      setSelectedContact(contactRes.data.data);
      setMessages(messagesRes.data.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setSending(true);
    try {
      await whatsappAPI.sendMessage(selectedContact.phone_number, newMessage);
      setNewMessage('');
      // Reload messages
      if (selectedContact.id) {
        loadContactAndMessages(selectedContact.id);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="h-full flex bg-white rounded-lg shadow overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-3">Chats</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => loadContactAndMessages(contact.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition ${
                  selectedContact?.id === contact.id ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold">
                      {contact.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                      {contact.last_message_at && (
                        <span className="text-xs text-gray-500">{formatDate(contact.last_message_at)}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{formatPhone(contact.phone_number)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">
                        {selectedContact.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                      <p className="text-sm text-gray-600 flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{formatPhone(selectedContact.phone_number)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Select a contact to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isOutbound = message.direction === 'outbound';

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md px-4 py-2 rounded-lg ${
          isOutbound
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isOutbound ? 'text-purple-200' : 'text-gray-500'}`}>
          {formatDate(message.created_at)}
        </p>
      </div>
    </div>
  );
}

// ============================================

// FILE: src/app/(dashboard)/campaigns/page.tsx
'use client';

import { useState } from 'react';
import { Send, Users } from 'lucide-react';

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
        <p className="text-gray-600 mt-1">Create and manage broadcast campaigns</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Send className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaigns Coming Soon</h2>
        <p className="text-gray-600 mb-6">
          Send targeted messages to multiple contacts at once. This feature will be available soon!
        </p>
        <button
          disabled
          className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
        >
          Create Campaign
        </button>
      </div>
    </div>
  );
}

// ============================================

// FILE: src/app/(dashboard)/settings/page.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { User, Building, Key } from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <User className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold">Profile Information</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue={user?.fullName}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue={user?.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Business Profile */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Building className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold">Business Profile</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              placeholder="Enter your business name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
              <option>Select industry</option>
              <option>E-commerce</option>
              <option>Real Estate</option>
              <option>Healthcare</option>
              <option>Food & Beverage</option>
              <option>Other</option>
            </select>
          </div>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Save Changes
          </button>
        </div>
      </div>

      {/* API Access */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Key className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold">API Access</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Generate API keys to integrate WhatsFlow with your applications.
        </p>
        
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Generate API Key
        </button>
      </div>
    </div>
  );
}