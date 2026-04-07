const TOKEN_KEY = 'token';
const REMEMBER_CREDENTIALS_KEY = 'rememberedCredentials';

export interface RememberedCredentials {
  username: string;
  password: string;
}

export const getToken = () => String(uni.getStorageSync(TOKEN_KEY) || '');

export const setToken = (token: string) => {
  uni.setStorageSync(TOKEN_KEY, token);
};

export const clearToken = () => {
  uni.removeStorageSync(TOKEN_KEY);
};

export const isSessionLoggedIn = () => !!getToken();

// Kept for compatibility with existing imports.
export const setSessionLoggedIn = (value: boolean) => {
  if (!value) {
    clearToken();
  }
};

// Kept for compatibility with existing imports.
export const resetSessionLogin = () => {
  // Intentionally no-op. Token lifecycle is controlled by real verification.
};

export const saveRememberedCredentials = (credentials: RememberedCredentials) => {
  uni.setStorageSync(REMEMBER_CREDENTIALS_KEY, credentials);
};

export const getRememberedCredentials = (): RememberedCredentials | null => {
  const raw = uni.getStorageSync(REMEMBER_CREDENTIALS_KEY);
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const username = String((raw as Record<string, unknown>).username || '').trim();
  const password = String((raw as Record<string, unknown>).password || '');
  if (!username || !password) {
    return null;
  }

  return { username, password };
};

export const clearRememberedCredentials = () => {
  uni.removeStorageSync(REMEMBER_CREDENTIALS_KEY);
};
