'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { contactsAPI, messagesAPI, whatsappAPI, devicesAPI } from '@/lib/api';
import { Contact, Message, Device } from '@/types';
import { Search, Send, Phone, UserPlus, Smartphone } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { socket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newMessageDeviceId, setNewMessageDeviceId] = useState<string | null>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [selectedExistingContact, setSelectedExistingContact] = useState<Contact | null>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    loadDevices();
    loadContacts();

    // Connect Socket.IO and join business room
    if (user) {
      if (!user.businessProfileId) {
        console.error('businessProfileId is missing from user object. Please log out and log back in.');
        return;
      }

      socket.connect();
      socket.emit('join-business', user.businessProfileId);
      console.log('Joined Socket.IO room:', `business-${user.businessProfileId}`);

      // Listen for new messages
      socket.on('new-message', (message: Message) => {
        console.log('Received new-message event:', message);
        // If message is for currently selected contact, add it to the list
        if (selectedContact && message.contact_id === selectedContact.id) {
          setMessages((prev) => [...prev, message]);
        }
        // Reload contacts to update last message time
        loadContacts();
      });

      return () => {
        socket.off('new-message');
        socket.disconnect();
      };
    }
  }, [user, selectedContact]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
      setUserHasScrolled(false);
    }
  }, [selectedContact]);

  // Auto-scroll to bottom when messages change (only if user hasn't scrolled up)
  useEffect(() => {
    if (messages.length > 0 && !userHasScrolled) {
      scrollToBottom('smooth');
    }
  }, [messages, userHasScrolled]);

  // Detect when user scrolls up manually
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

    // If user is at bottom, enable auto-scroll, otherwise disable it
    setUserHasScrolled(!isAtBottom);
  };

  // Handle contact preselection from URL parameter
  useEffect(() => {
    const contactId = searchParams.get('contact');
    if (contactId && contacts.length > 0 && !selectedContact) {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        setSelectedContact(contact);
      }
    }
  }, [contacts, searchParams, selectedContact]);

  const loadDevices = async () => {
    try {
      const response = await devicesAPI.getAll();
      const devicesData = response.data.data;
      setDevices(devicesData);
      // Don't auto-select a device - let user choose or default to "All Devices"
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getAll();
      // Show all contacts, including newly added ones with 0 messages
      setContacts(response.data.data.contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (contactId: string) => {
    try {
      const response = await messagesAPI.getConversation(contactId);
      setMessages(response.data.data);
      // Scroll to bottom after a short delay to ensure messages are rendered
      setTimeout(() => scrollToBottom('auto'), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setSending(true);
    try {
      await whatsappAPI.sendMessage(selectedContact.phone_number, newMessage);
      setNewMessage('');
      // Reload messages and ensure we scroll to show the sent message
      setUserHasScrolled(false);
      await loadMessages(selectedContact.id);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let contactToOpen: Contact;

      // If existing contact selected, use it
      if (selectedExistingContact) {
        contactToOpen = selectedExistingContact;
      } else {
        // Check if contact exists by phone number
        const existingContact = contacts.find(
          (c) => c.phone_number === newContactPhone || c.phone_number === newContactPhone.replace(/\s+/g, '')
        );

        if (existingContact) {
          contactToOpen = existingContact;
        } else {
          // Create new contact
          await contactsAPI.create(newContactPhone, newContactName);
          await loadContacts();

          // Find the newly created contact
          const updatedContactsRes = await contactsAPI.getAll();
          const newContact = updatedContactsRes.data.data.contacts.find(
            (c: Contact) => c.phone_number === newContactPhone || c.phone_number === newContactPhone.replace(/\s+/g, '')
          );

          if (!newContact) {
            throw new Error('Failed to find newly created contact');
          }

          contactToOpen = newContact;
        }
      }

      // Set device filter if specified
      if (newMessageDeviceId) {
        setSelectedDeviceId(newMessageDeviceId);
      } else if (contactToOpen.last_device_id) {
        setSelectedDeviceId(contactToOpen.last_device_id);
      }

      // Open the chat
      setSelectedContact(contactToOpen);

      // Reset modal state
      setShowAddContact(false);
      setNewContactPhone('');
      setNewContactName('');
      setNewMessageDeviceId(null);
      setContactSearchQuery('');
      setSelectedExistingContact(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to open contact');
    }
  };

  // Filter contacts by selected device
  // Note: Only filter if contacts have device tracking data
  const filteredContactsByDevice = selectedDeviceId
    ? contacts.filter((c) => {
        // If contact has no device assigned yet, show it in all tabs for now
        // Once backend starts tracking device_id, this will filter properly
        if (!c.last_device_id) return true;
        return c.last_device_id === selectedDeviceId;
      })
    : contacts;

  const filteredContacts = filteredContactsByDevice.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone_number.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow overflow-hidden">
      {/* Device Tabs */}
      {devices.length > 1 && (
        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-1 p-2 overflow-x-auto">
            <button
              onClick={() => setSelectedDeviceId(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedDeviceId === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Devices
            </button>
            {devices.map((device) => (
              <button
                key={device.id}
                onClick={() => setSelectedDeviceId(device.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-2 ${
                  selectedDeviceId === device.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{device.device_name}</span>
                {device.status === 'connected' && (
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Contacts List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 space-y-3">
            <button
              onClick={() => setShowAddContact(true)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Message</span>
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No contacts found</p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const contactDevice = devices.find((d) => d.id === contact.last_device_id);
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedContact?.id === contact.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {contact.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                        {contactDevice && devices.length > 1 && (
                          <span className="flex-shrink-0 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                            {contactDevice.device_name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{contact.phone_number}</p>
                    </div>
                    {contact.last_message_at && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(contact.last_message_at)}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center space-x-3 flex-shrink-0">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {selectedContact.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">{selectedContact.phone_number}</p>
                    {selectedContact.device_name && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500 flex items-center space-x-1">
                          <Smartphone className="w-3 h-3" />
                          <span>{selectedContact.device_name}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 min-h-0"
              >
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const messageDevice = devices.find((d) => d.id === message.device_id);
                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.direction === 'outbound'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-900'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            <div className="flex items-center justify-between mt-1 space-x-2">
                              <p
                                className={`text-xs ${
                                  message.direction === 'outbound'
                                    ? 'text-purple-200'
                                    : 'text-gray-500'
                                }`}
                              >
                                {formatDate(message.created_at)}
                              </p>
                              {messageDevice && devices.length > 1 && (
                                <span
                                  className={`text-xs flex items-center space-x-1 ${
                                    message.direction === 'outbound'
                                      ? 'text-purple-200'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  <Smartphone className="w-3 h-3" />
                                  <span>{messageDevice.device_name}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* Invisible element to scroll to */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>{sending ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a contact to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">New Message</h2>
            <form onSubmit={handleAddContact} className="space-y-4">
              {/* Contact Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Existing Contacts
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={contactSearchQuery}
                    onChange={(e) => {
                      setContactSearchQuery(e.target.value);
                      setSelectedExistingContact(null);
                    }}
                    placeholder="Search by name or number..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Contact suggestions dropdown */}
                {contactSearchQuery && !selectedExistingContact && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {contacts
                      .filter(
                        (c) =>
                          c.name?.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                          c.phone_number.includes(contactSearchQuery)
                      )
                      .slice(0, 5)
                      .map((contact) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => {
                            setSelectedExistingContact(contact);
                            setContactSearchQuery(contact.name || contact.phone_number);
                            setNewContactPhone('');
                            setNewContactName('');
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-purple-50 flex items-center space-x-3 border-b last:border-b-0"
                        >
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {contact.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                            <p className="text-sm text-gray-500 truncate">{contact.phone_number}</p>
                          </div>
                        </button>
                      ))}
                    {contacts.filter(
                      (c) =>
                        c.name?.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                        c.phone_number.includes(contactSearchQuery)
                    ).length === 0 && (
                      <p className="px-4 py-2 text-sm text-gray-500">No contacts found</p>
                    )}
                  </div>
                )}

                {selectedExistingContact && (
                  <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {selectedExistingContact.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedExistingContact.name}</p>
                        <p className="text-sm text-gray-500">{selectedExistingContact.phone_number}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExistingContact(null);
                        setContactSearchQuery('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              {!selectedExistingContact && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or enter new number</span>
                    </div>
                  </div>

                  {/* New Contact Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      placeholder="+1234567890"
                      disabled={!!selectedExistingContact}
                      required={!selectedExistingContact}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 disabled:bg-gray-100"
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
                      disabled={!!selectedExistingContact}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                    />
                  </div>
                </>
              )}

              {/* Device Selection */}
              {devices.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send from Device (Optional)
                  </label>
                  <select
                    value={newMessageDeviceId || ''}
                    onChange={(e) => setNewMessageDeviceId(e.target.value || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
                  >
                    <option value="">Auto (use contact's last device)</option>
                    {devices
                      .filter((d) => d.status === 'connected')
                      .map((device) => (
                        <option key={device.id} value={device.id}>
                          {device.device_name} ({device.phone_number})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={!selectedExistingContact && !newContactPhone}
                  className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedExistingContact ? 'Open Chat' : 'Add Contact'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddContact(false);
                    setNewContactPhone('');
                    setNewContactName('');
                    setNewMessageDeviceId(null);
                    setContactSearchQuery('');
                    setSelectedExistingContact(null);
                  }}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}
