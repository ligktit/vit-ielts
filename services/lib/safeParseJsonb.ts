/**
 * Safely parse a JSONB field that might be double-encoded as a string.
 * 
 * When migrating from WordPress, some JSONB fields were stored as JSON strings
 * instead of native JSONB objects. This helper handles both cases:
 * - If value is already an array/object, return as-is
 * - If value is a string, attempt to JSON.parse it
 * - Otherwise return the fallback (default: null)
 */
export function safeParseJsonb<T>(value: unknown, fallback: T | null = null): T | null {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}
