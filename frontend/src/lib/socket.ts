'use client';

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:2152';

// Create socket instance (will be initialized on first use)
let socketInstance: Socket | null = null;

export const socket = {
  connect: () => {
    if (typeof window === 'undefined') return;

    if (!socketInstance || !socketInstance.connected) {
      const token = localStorage.getItem('token');

      socketInstance = io(SOCKET_URL, {
        auth: {
          token,
        },
        autoConnect: true,
      });

      socketInstance.on('connect', () => {
        console.log('✅ Socket connected');
      });

      socketInstance.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
  },

  disconnect: () => {
    if (socketInstance) {
      socketInstance.disconnect();
    }
  },

  emit: (event: string, ...args: any[]) => {
    if (socketInstance) {
      socketInstance.emit(event, ...args);
    }
  },

  on: (event: string, callback: (...args: any[]) => void) => {
    if (socketInstance) {
      socketInstance.on(event, callback);
    }
  },

  off: (event: string, callback?: (...args: any[]) => void) => {
    if (socketInstance) {
      if (callback) {
        socketInstance.off(event, callback);
      } else {
        socketInstance.off(event);
      }
    }
  },
};

// Keep old exports for backwards compatibility
export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  socket.disconnect();
  socketInstance = null;
};
