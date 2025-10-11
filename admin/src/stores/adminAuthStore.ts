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
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setAdmin: (admin: AdminUser, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      _hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      setAdmin: (admin, token) => {
        console.log('setAdmin called with:', { admin, token });
        set({ admin, token, _hasHydrated: true });
        console.log('State after setAdmin:', get());
      },
      logout: () => set({ admin: null, token: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'admin-auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);


