'use client';

import { create } from 'zustand';

interface WhatsAppStatus {
  status: 'not_connected' | 'qr_pending' | 'connected' | 'disconnected';
  phoneNumber?: string;
  qrCode?: string;
  lastConnected?: string;
}

interface WhatsAppState {
  status: WhatsAppStatus | null;
  setStatus: (status: WhatsAppStatus) => void;
  isConnected: () => boolean;
}

export const useWhatsAppStore = create<WhatsAppState>((set, get) => ({
  status: null,

  setStatus: (status) => set({ status }),

  isConnected: () => {
    return get().status?.status === 'connected';
  },
}));
