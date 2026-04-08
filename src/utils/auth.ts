const TOKEN_KEY = 'token';
const CURRENT_USER_KEY = 'currentUser';
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

export const getCurrentUser = () => {
  const stored = String(uni.getStorageSync(CURRENT_USER_KEY) || '');
  if (stored) return stored;
  
  // 备用方案 1: 从 Token 尝试解析 (如果是 JWT 标准的话)
  try {
    const token = getToken();
    if (token && token.includes('.')) {
      let payloadBase64 = token.split('.')[1];
      payloadBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      while (payloadBase64.length % 4) {
        payloadBase64 += '=';
      }
      const payloadStr = decodeURIComponent(
        atob(payloadBase64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const decodedInfo = JSON.parse(payloadStr);
      if (decodedInfo && decodedInfo.username) {
        uni.setStorageSync(CURRENT_USER_KEY, decodedInfo.username);
        return String(decodedInfo.username);
      }
    }
  } catch (e) {
    console.warn('Failed to decode token payload:', e);
  }

  // 备用方案 2: 使用保持登录状态保存的信息
  const remembered = getRememberedCredentials();
  if (remembered && remembered.username) return remembered.username;

  return 'frontend-app'; // Default fallback
};

export const setCurrentUser = (username: string) => {
  uni.setStorageSync(CURRENT_USER_KEY, username);
};

export const clearCurrentUser = () => {
  uni.removeStorageSync(CURRENT_USER_KEY);
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
