// Auth Helper — JWT token management
const TOKEN_KEY = 'qs_token';
const USER_KEY  = 'qs_user';

export const saveToken  = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken   = ()      => localStorage.getItem(TOKEN_KEY);
export const removeToken= ()      => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); };
export const isLoggedIn = ()      => !!getToken();
export const saveUser   = (user)  => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser    = ()      => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };

export const authHeader = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};
