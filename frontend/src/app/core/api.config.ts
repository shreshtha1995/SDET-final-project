const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

const rawApiOrigin = env?.['NG_APP_API_ORIGIN']?.trim();

// Remove trailing slash so URL concatenation stays predictable.
export const API_ORIGIN = (rawApiOrigin && rawApiOrigin.length > 0 ? rawApiOrigin : 'https://sdet-final-project.onrender.com/').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}
