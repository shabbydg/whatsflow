// FILE: src/app/(dashboard)/messages/page.tsx (ENHANCED VERSION)
// Replace the existing messages page with this enhanced version

'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { contactsAPI, messagesAPI, whatsappAPI } from '@/lib/api';
import { Contact, Message } from '@/types';
import { 
  Send, Phone, Search, Paperclip, Smile, MoreVertical,
  Check, CheckCheck, Image as ImageIcon, File, Mic, X
} from 'lucide-react';
import { formatDate, formatPhone } from '@/lib/utils';
import { getSocket, initSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const contactIdParam = searchParams.get('contact');
  const user = useAuthStore((state) => state.user);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<any>(null);

  // Initialize Socket.IO
  useEffect(() => {
    if (user) {
      socketRef.current = initSocket('business-profile-id'); // Replace with actual business profile ID
      
      const socket = getSocket();
      if (socket) {
        // Listen for new messages
        socket.on('message:new', (message: Message) => {
          if (selectedContact && message.contactId === selectedContact.id) {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
          }
          // Update contact list
          loadContacts();
        });

        // Listen for sent messages
        socket.on('message:sent', (message: Message) => {
          if (selectedContact && message.contactId === selectedContact.id) {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
          }
        });

        // Listen for message status updates
        socket.on('message:status', ({ messageId, status }) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.whatsapp_message_id === messageId 
                ? { ...msg, status }
                : msg
            )
          );
        });

        // Listen for typing indicators
        socket.on('contact:typing', ({ contactId, isTyping }) => {
          if (selectedContact && contactId === selectedContact.id) {
            setIsTyping(isTyping);
          }
        });
      }

      return () => {
        if (socket) {
          socket.off('message:new');
          socket.off('message:sent');
          socket.off('message:status');
          socket.off('contact:typing');
        }
      };
    }
  }, [user, selectedContact]);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (contactIdParam) {
      loadContactAndMessages(contactIdParam);
    }
  }, [contactIdParam]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    if ((!newMessage.trim() && !selectedFile) || !selectedContact) return;

    setSending(true);
    try {
      // Handle file upload if present
      let mediaPath = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        // Upload file to server first
        // mediaPath = await uploadFile(formData);
      }

      await whatsappAPI.sendMessage(selectedContact.phone_number, newMessage);
      setNewMessage('');
      setSelectedFile(null);
      
      // Messages will be updated via Socket.IO
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmoji(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="h-full flex bg-white rounded-lg shadow overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 bg-white border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-3">Chats</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-purple-600 text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact?.id === contact.id}
                onClick={() => loadContactAndMessages(contact.id)}
                hasUnread={false} // Implement unread logic
              />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {selectedContact.profile_pic_url ? (
                      <img 
                        src={selectedContact.profile_pic_url} 
                        alt={selectedContact.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {selectedContact.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                    <p className="text-xs text-gray-500 flex items-center space-x-1">
                      {isTyping ? (
                        <span className="text-green-600">typing...</span>
                      ) : (
                        <>
                          <Phone className="w-3 h-3" />
                          <span>{formatPhone(selectedContact.phone_number)}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => setShowContactInfo(!showContactInfo)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23d1d5db\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")'
              }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <MessageBubble 
                        key={message.id} 
                        message={message}
                        showAvatar={index === 0 || messages[index - 1].direction !== message.direction}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                {selectedFile && (
                  <div className="mb-2 flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                    <File className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 flex-1">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <Smile className="w-5 h-5 text-gray-600" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,.pdf,.doc,.docx"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!newMessage.trim() && !selectedFile)}
                    className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Emoji Picker */}
                {showEmoji && (
                  <div className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-8 gap-2">
                      {['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🎉', '🔥', '✨', '💯', '🙏', '👏', '💪', '🎯'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-2xl hover:bg-gray-100 rounded p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
              <div className="text-center">
                <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a chat to start messaging</p>
                <p className="text-sm">Choose from your existing conversations</p>
              </div>
            </div>
          )}
        </div>

        {/* Contact Info Sidebar */}
        {showContactInfo && selectedContact && (
          <ContactInfoSidebar 
            contact={selectedContact} 
            onClose={() => setShowContactInfo(false)} 
          />
        )}
      </div>
    </div>
  );
}

// Contact List Item Component
function ContactItem({ 
  contact, 
  isSelected, 
  onClick, 
  hasUnread 
}: { 
  contact: Contact; 
  isSelected: boolean; 
  onClick: () => void;
  hasUnread: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 text-left hover:bg-gray-100 border-b border-gray-100 transition ${
        isSelected ? 'bg-gray-100' : 'bg-white'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative flex-shrink-0">
          {contact.profile_pic_url ? (
            <img 
              src={contact.profile_pic_url} 
              alt={contact.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-lg">
                {contact.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">3</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
              {contact.name}
            </h3>
            {contact.last_message_at && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatDate(contact.last_message_at)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {formatPhone(contact.phone_number)} • {contact.total_messages} messages
          </p>
        </div>
      </div>
    </button>
  );
}

// Enhanced Message Bubble Component
function MessageBubble({ 
  message, 
  showAvatar 
}: { 
  message: Message; 
  showAvatar: boolean;
}) {
  const isOutbound = message.direction === 'outbound';

  const getStatusIcon = () => {
    if (message.direction === 'inbound') return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Check className="w-4 h-4 opacity-50" />;
    }
  };

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`flex items-end space-x-2 max-w-md ${isOutbound ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {showAvatar && !isOutbound && (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
        )}
        {!showAvatar && !isOutbound && (
          <div className="w-8"></div>
        )}
        
        <div>
          <div
            className={`px-4 py-2 rounded-lg ${
              isOutbound
                ? 'bg-purple-600 text-white rounded-br-none'
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'
            }`}
          >
            {/* Media Preview */}
            {message.media_url && (
              <div className="mb-2">
                {message.message_type === 'image' ? (
                  <img 
                    src={message.media_url} 
                    alt="Media" 
                    className="rounded max-w-xs cursor-pointer hover:opacity-90"
                  />
                ) : message.message_type === 'video' ? (
                  <video 
                    src={message.media_url} 
                    controls 
                    className="rounded max-w-xs"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                    <File className="w-5 h-5" />
                    <span className="text-sm">Document</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Message Content */}
            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
            
            {/* Timestamp & Status */}
            <div className={`flex items-center space-x-1 mt-1 ${isOutbound ? 'justify-end' : ''}`}>
              <span className={`text-xs ${isOutbound ? 'text-purple-200' : 'text-gray-500'}`}>
                {new Date(message.created_at).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {getStatusIcon()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Contact Info Sidebar Component
function ContactInfoSidebar({ 
  contact, 
  onClose 
}: { 
  contact: Contact; 
  onClose: () => void;
}) {
  const [tags, setTags] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Contact Info</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Contact Details */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile */}
        <div className="p-6 text-center border-b border-gray-200">
          {contact.profile_pic_url ? (
            <img 
              src={contact.profile_pic_url} 
              alt={contact.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold text-3xl">
                {contact.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900 mb-1">{contact.name}</h2>
          <p className="text-sm text-gray-600">{formatPhone(contact.phone_number)}</p>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600">{contact.total_messages}</p>
              <p className="text-xs text-gray-600">Messages</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {contact.last_message_at ? formatDate(contact.last_message_at) : 'Never'}
              </p>
              <p className="text-xs text-gray-600">Last Contact</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {contact.tags && contact.tags.length > 0 ? (
              contact.tags.map((tag: any) => (
                <span 
                  key={tag.id}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: tag.color + '20', 
                    color: tag.color 
                  }}
                >
                  {tag.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No tags yet</p>
            )}
          </div>
          <button className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium">
            + Add Tag
          </button>
        </div>

        {/* Notes */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this contact..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
            rows={4}
          />
          <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
            Save Notes
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium">
              Send Template Message
            </button>
            <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">
              Schedule Follow-up
            </button>
            <button className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium">
              View Purchase History
            </button>
            <button className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium">
              Block Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}