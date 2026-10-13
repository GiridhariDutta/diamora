/**
 * Client-side Cookie Management Utility for Auth Tokens
 */

/**
 * Set a cookie with name, value, and expiration days
 */
export const setCookie = (name, value, days = 7) => {
  try {
    if (typeof localStorage !== 'undefined' && value) {
      localStorage.setItem(name, value);
    }
  } catch (e) {}
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

/**
 * Get cookie value by name (with localStorage fallback)
 */
export const getCookie = (name) => {
  let val = '';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    if (match) val = decodeURIComponent(match[1]);
  }
  if (!val && typeof localStorage !== 'undefined') {
    try {
      val = localStorage.getItem(name) || '';
    } catch (e) {}
  }
  return val;
};

/**
 * Remove a cookie by name (and clear from localStorage)
 */
export const removeCookie = (name) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(name);
    }
  } catch (e) {}
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};
