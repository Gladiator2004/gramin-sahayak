/**
 * Network utilities — resilient fetch with timeout, retries, and friendly errors.
 * Designed for low-bandwidth rural environments.
 */

export interface FetchOptions extends RequestInit {
  /** Timeout per attempt in ms (default: 25000) */
  timeoutMs?: number;
  /** Number of retry attempts on network failure / 5xx (default: 2 → up to 3 tries) */
  retries?: number;
  /** Backoff base in ms (default: 800) */
  backoffMs?: number;
  /** Optional AbortSignal that cancels the entire operation */
  signal?: AbortSignal;
}

export class NetworkError extends Error {
  status?: number;
  isTimeout: boolean;
  isOffline: boolean;
  constructor(message: string, opts: { status?: number; isTimeout?: boolean; isOffline?: boolean } = {}) {
    super(message);
    this.name = "NetworkError";
    this.status = opts.status;
    this.isTimeout = !!opts.isTimeout;
    this.isOffline = !!opts.isOffline;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * fetchWithRetry — wraps fetch with timeout + exponential backoff retries.
 * Retries on network errors and 5xx responses. Does NOT retry 4xx.
 */
export async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const {
    timeoutMs = 25000,
    retries = 2,
    backoffMs = 800,
    signal: externalSignal,
    ...init
  } = options;

  let lastError: unknown;
  const totalAttempts = retries + 1;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    if (externalSignal?.aborted) {
      throw new NetworkError("Request cancelled");
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NetworkError("You appear to be offline. Please check your connection.", { isOffline: true });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener("abort", onExternalAbort);

    try {
      const resp = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", onExternalAbort);

      // Retry on 5xx
      if (resp.status >= 500 && resp.status < 600 && attempt < totalAttempts - 1) {
        lastError = new NetworkError(`Server error ${resp.status}`, { status: resp.status });
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }
      return resp;
    } catch (err) {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", onExternalAbort);

      const isAbort = (err as Error)?.name === "AbortError";
      const isTimeout = isAbort && !externalSignal?.aborted;

      if (externalSignal?.aborted) {
        throw new NetworkError("Request cancelled");
      }

      lastError = isTimeout
        ? new NetworkError("Network is slow. Please wait or try again.", { isTimeout: true })
        : new NetworkError("Network error. Please check your connection.", { isOffline: typeof navigator !== "undefined" && !navigator.onLine });

      if (attempt < totalAttempts - 1) {
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new NetworkError("Request failed");
}

/**
 * Friendly error message for users (already translated externally if needed).
 */
export function friendlyErrorMessage(err: unknown): string {
  if (err instanceof NetworkError) {
    if (err.isOffline) return "You appear to be offline. Please check your connection.";
    if (err.isTimeout) return "Network is slow. Please wait or try again.";
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

/* ========================= LocalStorage cache ========================= */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const CACHE_PREFIX = "gs-cache:";

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, value: T, ttlMs = 6 * 60 * 60 * 1000): void {
  try {
    const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // quota or unavailable — ignore
  }
}

/* ========================= Simple client-side rate limit ========================= */

const rateBuckets = new Map<string, number[]>();

/**
 * Returns true if the action is allowed. Uses a sliding window.
 * @param key e.g. "chat", "verify"
 * @param maxRequests in the window
 * @param windowMs window size in ms
 */
export function isRateLimited(key: string, maxRequests = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= maxRequests) {
    rateBuckets.set(key, arr);
    return true;
  }
  arr.push(now);
  rateBuckets.set(key, arr);
  return false;
}
