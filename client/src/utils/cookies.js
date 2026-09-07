/**
 * Client-side Cookie Management Utility for Auth Tokens
 */

/**
 * Set a cookie with name, value, and expiration days
 */
export const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

/**
 * Get cookie value by name
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
};

/**
 * Remove a cookie by name
 */
export const removeCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};
