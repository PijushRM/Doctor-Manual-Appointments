import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandSecureStorage} from 'src/configs/storage';
import {
  normalizeIdentifier,
  validateLogin,
  validatePasswordChange,
  type LoginError,
  type PasswordChangeError,
} from 'src/features/auth/credentials';
import {ApiError, api, configureApi} from 'src/services/api';
import {applyDoctor, clearData, syncAll} from 'src/store/sync';

type AuthState = {
  token: string | null;
  identifier: string | null;
  isLoggedIn: boolean;
  // mode "register" creates the account first (first time on the server).
  logIn: (
    identifier: string,
    password: string,
    mode?: 'login' | 'register',
  ) => Promise<LoginError | null>;
  logOut: () => void;
  changePassword: (
    current: string,
    next: string,
    confirm: string,
  ) => Promise<PasswordChangeError | null>;
};

const networkError = (e: unknown): 'offline' | 'server' =>
  e instanceof ApiError && e.offline ? 'offline' : 'server';

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      identifier: null,
      isLoggedIn: false,
      logIn: async (identifier, password, mode = 'login') => {
        const error = validateLogin(identifier, password);
        if (error) {
          return error;
        }
        const id = normalizeIdentifier(identifier);
        try {
          const session =
            mode === 'register'
              ? await api.register(id, password)
              : await api.login(id, password);
          clearData();
          set({
            token: session.token,
            identifier: session.doctor.identifier,
            isLoggedIn: true,
          });
          applyDoctor(session.doctor);
          // A failure here shows the "Couldn't load" screen with Retry.
          await syncAll().catch(() => {});
          return null;
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) {
            return 'mismatch';
          }
          if (e instanceof ApiError && e.status === 409) {
            return 'exists';
          }
          if (e instanceof ApiError && e.status === 400) {
            return e.details?.password ? 'shortPassword' : 'missingIdentifier';
          }
          return networkError(e);
        }
      },
      // Patient data lives on the server only; drop what is in memory.
      logOut: () => {
        set({token: null, isLoggedIn: false});
        clearData();
      },
      changePassword: async (current, next, confirm) => {
        const error = validatePasswordChange(next, confirm);
        if (error) {
          return error;
        }
        try {
          const {token} = await api.changePassword(current, next, confirm);
          set({token});
          return null;
        } catch (e) {
          if (e instanceof ApiError && e.status === 400) {
            if (e.details?.current) {
              return 'wrongCurrent';
            }
            return e.details?.confirm ? 'notMatching' : 'shortPassword';
          }
          return networkError(e);
        }
      },
    }),
    {
      name: 'auth',
      version: 1,
      storage: zustandSecureStorage,
      partialize: s => ({
        token: s.token,
        identifier: s.identifier,
        isLoggedIn: s.isLoggedIn,
      }),
      // v0 kept a local password hash and no token: log in again with the server.
      migrate: () => ({token: null, identifier: null, isLoggedIn: false}),
    },
  ),
);

configureApi({
  getToken: () => useAuthStore.getState().token,
  // Token expired or account gone: back to Login.
  onUnauthorized: () => {
    if (useAuthStore.getState().isLoggedIn) {
      useAuthStore.getState().logOut();
    }
  },
});
