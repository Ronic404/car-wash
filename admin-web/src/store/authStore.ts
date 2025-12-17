import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiService from '../services/apiService';
import logger from '../utils/logger';

interface IAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
}

interface IAuthState {
  token: string | null;
  admin: IAdmin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

/**
 * Store для управления аутентификацией
 */
export const useAuthStore = create<IAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await apiService.login(email, password);
          set({
            token: response.token,
            admin: response.admin,
            isAuthenticated: true,
          });
          // Сохраняем токен для использования в API
          apiService.setToken(response.token);
        } catch (error) {
          logger.error('Ошибка входа', { error, email });
          throw error;
        }
      },

      logout: () => {
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
        });
        apiService.setToken(null);
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          apiService.setToken(token);
          const admin = await apiService.getMe();
          set({
            admin,
            isAuthenticated: true,
          });
        } catch (error) {
          logger.error('Ошибка проверки аутентификации', { error });
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
      }),
    }
  )
);

