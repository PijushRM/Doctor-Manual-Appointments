import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandSecureStorage} from 'src/configs/storage';
import {
  normalizeIdentifier,
  validateLogin,
  validatePasswordChange,
  validateReset,
  type LoginError,
  type PasswordChangeError,
  type ResetError,
} from 'src/features/auth/credentials';
import {ApiError, api, configureApi, type ServerDoctor} from 'src/services/api';
import {applyDoctor, clearData, syncAll} from 'src/store/sync';
import {logger} from 'src/utils/logger';

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
  // Forgot password: the clinic reset code + a new password; logs in.
  resetPassword: (
    identifier: string,
    code: string,
    password: string,
    confirm: string,
  ) => Promise<ResetError | null>;
  logOut: () => void;
  changePassword: (
    current: string,
    next: string,
    confirm: string,
  ) => Promise<PasswordChangeError | null>;
};

// Logged in (login, new account or password reset): start fresh with the
// server's data. A failed first load shows the "Couldn't load" screen.
const startSession = async (session: {token: string; doctor: ServerDoctor}) => {
  clearData();
  useAuthStore.setState({
    token: session.token,
    identifier: session.doctor.identifier,
    isLoggedIn: true,
  });
  applyDoctor(session.doctor);
  await syncAll().catch(() => {});
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
          logger.info(
            'auth',
            mode === 'register' ? 'Account created' : 'Logged in',
          );
          await startSession(session);
          return null;
        } catch (e) {
          logger.warn(
            'auth',
            'Login failed',
            e instanceof ApiError ? e.status : e,
          );
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
      resetPassword: async (identifier, code, password, confirm) => {
        const error = validateReset(identifier, code, password, confirm);
        if (error) {
          return error;
        }
        try {
          const session = await api.resetPassword({
            identifier: normalizeIdentifier(identifier),
            code: code.trim(),
            password,
            confirm,
          });
          logger.info('auth', 'Password reset; logged in');
          await startSession(session);
          return null;
        } catch (e) {
          logger.warn(
            'auth',
            'Password reset failed',
            e instanceof ApiError ? e.status : e,
          );
          if (e instanceof ApiError) {
            if (e.status === 404) {
              return 'noAccount';
            }
            if (e.status === 429) {
              return 'locked';
            }
            if (e.status === 503) {
              return 'notSetUp';
            }
            if (e.status === 400) {
              return e.details?.code
                ? 'wrongCode'
                : e.details?.confirm
                ? 'notMatching'
                : e.details?.password
                ? 'shortPassword'
                : 'missingIdentifier';
            }
          }
          return networkError(e);
        }
      },
      // Patient data lives on the server only; drop what is in memory.
      logOut: () => {
        logger.info('auth', 'Logged out');
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
