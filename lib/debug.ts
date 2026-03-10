/**
 * Centralized debug logging utility.
 *
 * Controlled by env var `NEXT_PUBLIC_DEBUG`:
 *   - `true` / `1` / `*`   → all namespaces enabled
 *   - `api,auth`            → only those namespaces enabled
 *   - unset / `false` / `0` → all debug logging disabled
 *
 * Usage:
 * ```ts
 * import { debug } from "~/lib/debug";
 * const log = debug("auth");          // creates namespaced logger
 * log("user logged in", { id: 123 }); // [auth] user logged in { id: 123 }
 * log.warn("token expiring soon");    // [auth] ⚠ token expiring soon
 * log.error("failed", err);           // [auth] ✖ failed Error: ...
 * ```
 *
 * To clean up all debug calls later, grep for:  `debug("` or `from "~/lib/debug"`
 */

const DEBUG_ENV = process.env.NEXT_PUBLIC_DEBUG ?? process.env.DEBUG ?? "";

function isEnabled(namespace: string): boolean {
  if (!DEBUG_ENV) return false;
  const val = DEBUG_ENV.trim().toLowerCase();
  if (val === "false" || val === "0") return false;
  if (val === "true" || val === "1" || val === "*") return true;
  // Comma-separated namespace list: "api,auth,upload"
  return val.split(",").map((s) => s.trim()).includes(namespace.toLowerCase());
}

export type DebugLogger = {
  (...args: unknown[]): void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  enabled: boolean;
};

/**
 * Create a namespaced debug logger.
 *
 * @param namespace - Short name like "auth", "api", "upload", "webhook"
 */
export function debug(namespace: string): DebugLogger {
  const enabled = isEnabled(namespace);
  const prefix = `[${namespace}]`;

  const logger = ((...args: unknown[]) => {
    if (enabled) console.log(prefix, ...args);
  }) as DebugLogger;

  logger.warn = (...args: unknown[]) => {
    if (enabled) console.warn(prefix, "⚠", ...args);
  };

  logger.error = (...args: unknown[]) => {
    // Errors always log, regardless of debug mode
    console.error(prefix, "✖", ...args);
  };

  logger.enabled = enabled;

  return logger;
}

/**
 * Pre-built loggers for common namespaces.
 * Import directly: `import { dbg } from "~/lib/debug";`
 */
export const dbg = {
  auth: debug("auth"),
  api: debug("api"),
  upload: debug("upload"),
  webhook: debug("webhook"),
  email: debug("email"),
  cms: debug("cms"),
  quiz: debug("quiz"),
  order: debug("order"),
  user: debug("user"),
  affiliate: debug("affiliate"),
};
