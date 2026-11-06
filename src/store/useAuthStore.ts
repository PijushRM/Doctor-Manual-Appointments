import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandSecureStorage} from 'src/configs/storage';
import {
  createAccount,
  matchesAccount,
  validateLogin,
  validatePasswordChange,
  type Account,
  type LoginError,
  type PasswordChangeError,
} from 'src/features/auth/credentials';

type AuthState = {
  account: Account | null;
  isLoggedIn: boolean;
  logIn: (identifier: string, password: string) => LoginError | null;
  logOut: () => void;
  changePassword: (
    current: string,
    next: string,
    confirm: string,
  ) => PasswordChangeError | null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      account: null,
      isLoggedIn: false,
      logIn: (identifier, password) => {
        const error = validateLogin(identifier, password);
        if (error) {
          return error;
        }
        const {account} = get();
        if (!account) {
          set({account: createAccount(identifier, password), isLoggedIn: true});
          return null;
        }
        if (!matchesAccount(account, identifier, password)) {
          return 'mismatch';
        }
        set({isLoggedIn: true});
        return null;
      },
      // Keeps the account, so the next login must match it.
      logOut: () => set({isLoggedIn: false}),
      changePassword: (current, next, confirm) => {
        const {account} = get();
        if (!account) {
          return 'wrongCurrent';
        }
        const error = validatePasswordChange(account, current, next, confirm);
        if (!error) {
          // Fresh salt with the new password.
          set({account: createAccount(account.identifier, next)});
        }
        return error;
      },
    }),
    {name: 'auth', storage: zustandSecureStorage},
  ),
);
