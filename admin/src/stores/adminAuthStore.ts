import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'support_admin' | 'finance_admin' | 'read_only';
}

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  setAdmin: (admin: AdminUser, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      setAdmin: (admin, token) => set({ admin, token }),
      logout: () => set({ admin: null, token: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);


