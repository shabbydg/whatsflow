// FILE: src/components/messages/QuickReplies.tsx
'use client';

import { useState, useEffect } from 'react';
import { Zap, Plus, Edit2, Trash2 } from 'lucide-react';

interface QuickReply {
  id: string;
  shortcut: string;
  message: string;
  category?: string;
}

export default function QuickReplies({ onSelect }: { onSelect: (message: string) => void }) {
  const [replies, setReplies] = useState<QuickReply[]>([
    { id: '1', shortcut: '/hi', message: 'Hello! How can I help you today?', category: 'Greeting' },
    { id: '2', shortcut: '/thanks', message: 'Thank you for your message! We\'ll get back to you soon.', category: 'Greeting' },
    { id: '3', shortcut: '/price', message: 'Our pricing starts at $49/month. Would you like to schedule a demo?', category: 'Sales' },
    { id: '4', shortcut: '/hours', message: 'We\'re open Monday-Friday, 9 AM - 6 PM EST.', category: 'Support' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReplies = replies.filter(reply => 
    reply.shortcut.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute bottom-full left-0 mb-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Quick Replies</h3>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search replies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border-none rounded text-sm focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {/* Replies List */}
      <div className="overflow-y-auto max-h-64">
        {filteredReplies.map((reply) => (
          <button
            key={reply.id}
            onClick={() => onSelect(reply.message)}
            className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                {reply.shortcut}
              </span>
              {reply.category && (
                <span className="text-xs text-gray-500">{reply.category}</span>
              )}
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">{reply.message}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// FILE: src/components/messages/MessageTemplates.tsx
'use client';

import { useState } from 'react';
import { FileText, Star } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  variables?: string[];
}

export default function MessageTemplates({ onSelect }: { onSelect: (content: string) => void }) {
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: 'Welcome Message',
      content: 'Hi {{name}}! Welcome to {{business}}. How can we help you today?',
      category: 'Onboarding',
      variables: ['name', 'business']
    },
    {
      id: '2',
      name: 'Order Confirmation',
      content: 'Thank you for your order #{{order_id}}! Your items will be shipped within 2-3 business days.',
      category: 'Orders',
      variables: ['order_id']
    },
    {
      id: '3',
      name: 'Follow-up',
      content: 'Hi {{name}}, just following up on our conversation. Do you have any questions?',
      category: 'Sales',
      variables: ['name']
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Message Templates</span>
        </h3>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="space-y-2">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.content)}
            className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900">{template.name}</span>
              <Star className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">{template.content}</p>
            {template.variables && (
              <div className="flex flex-wrap gap-1 mt-2">
                {template.variables.map(variable => (
                  <span key={variable} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    {`{{${variable}}}`}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// FILE: src/components/messages/VoiceRecorder.tsx
'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';

export default function VoiceRecorder({ onSend }: { onSend: (audioBlob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const sendRecording = () => {
    if (audioBlob) {
      onSend(audioBlob);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
        <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1" />
        <button
          onClick={cancelRecording}
          className="p-2 text-red-600 hover:bg-red-100 rounded-full"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={sendRecording}
          className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
        <div className="flex items-center space-x-2 flex-1">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-red-600 font-mono font-medium">{formatTime(recordingTime)}</span>
        </div>
        <button
          onClick={stopRecording}
          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
        >
          <Square className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      className="p-2 hover:bg-gray-100 rounded-full transition"
      title="Record voice message"
    >
      <Mic className="w-5 h-5 text-gray-600" />
    </button>
  );
}

// FILE: src/lib/socket.ts (ENHANCED VERSION)
// Replace the existing socket.ts with this enhanced version

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = (businessProfileId: string) => {
  if (!socket || !socket.connected) {
    const token = localStorage.getItem('token');
    
    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      socket?.emit('join-business', businessProfileId);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      socket?.emit('join-business', businessProfileId);
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper to emit typing indicator
export const emitTyping = (contactId: string, isTyping: boolean) => {
  if (socket && socket.connected) {
    socket.emit('typing', { contactId, isTyping });
  }
};

// Helper to mark messages as read
export const emitMarkAsRead = (contactId: string) => {
  if (socket && socket.connected) {
    socket.emit('mark-as-read', { contactId });
  }
};