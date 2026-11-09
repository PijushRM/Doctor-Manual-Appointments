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
import {
  applyDoctor,
  clearCache,
  syncAll,
  uploadLocalProfile,
} from 'src/store/sync';

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
    (set, get) => ({
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
          // A different doctor on this phone: drop the previous one's cache.
          // (No previous login: data saved before the server is kept and uploaded.)
          const previous = get().identifier;
          if (previous && previous !== session.doctor.identifier) {
            clearCache();
          }
          set({
            token: session.token,
            identifier: session.doctor.identifier,
            isLoggedIn: true,
          });
          applyDoctor(
            previous ? session.doctor : await uploadLocalProfile(session.doctor),
          );
          await syncAll().catch(() => {}); // screens fill in on the next sync
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
      // Patient data is cleared too: it lives on the server, not this phone.
      logOut: () => {
        set({token: null, isLoggedIn: false});
        clearCache({keepPending: true});
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
