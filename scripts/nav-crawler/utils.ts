/**
 * Utility functions for NAV crawler
 */
import { AMFI_CONFIG } from './config';

/**
 * Fetch data from URL with retry logic
 */
export async function fetchWithRetry(
  url: string,
  retries = AMFI_CONFIG.MAX_RETRIES,
  timeoutMs = AMFI_CONFIG.TIMEOUT_MS
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    clearTimeout(timeout);
    return text;
  } catch (error: any) {
    clearTimeout(timeout);

    if (retries > 0) {
      console.warn(`Fetch failed for ${url}, retrying... (${retries} retries left)`);
      await sleep(AMFI_CONFIG.RETRY_DELAY_MS);
      return fetchWithRetry(url, retries - 1, timeoutMs);
    }

    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

/**
 * Sleep for given milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Format current date and time for logging
 */
export function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Validate scheme code (must be a positive number)
 */
export function isValidSchemeCode(code: string): boolean {
  const num = parseInt(code, 10);
  return !isNaN(num) && num > 0;
}

/**
 * Normalize ISIN value (convert "-" to null)
 */
export function normalizeIsin(isin: string): string | null {
  if (!isin || isin.trim() === '' || isin.trim() === '-') {
    return null;
  }
  return isin.trim();
}

/**
 * Progress logger
 */
export class ProgressLogger {
  private total: number;
  private current: number = 0;
  private lastLoggedPercent: number = 0;
  private startTime: number;

  constructor(
    total: number,
    private taskName: string
  ) {
    this.total = total;
    this.startTime = Date.now();
    console.log(`[${formatTimestamp()}] Starting: ${taskName} (${total} items)`);
  }

  increment(count: number = 1): void {
    this.current += count;
    const percent = Math.floor((this.current / this.total) * 100);

    // Log every 10%
    if (percent >= this.lastLoggedPercent + 10) {
      this.lastLoggedPercent = percent;
      const elapsed = Date.now() - this.startTime;
      const rate = this.current / (elapsed / 1000);
      const remaining = (this.total - this.current) / rate;

      console.log(
        `[${formatTimestamp()}] Progress: ${percent}% (${this.current}/${this.total}) - ` +
          `${rate.toFixed(1)} items/sec - ETA: ${remaining.toFixed(0)}s`
      );
    }
  }

  finish(): void {
    const elapsed = Date.now() - this.startTime;
    console.log(
      `[${formatTimestamp()}] Completed: ${this.taskName} - ` +
        `${this.current} items in ${(elapsed / 1000).toFixed(1)}s`
    );
  }

  error(message: string): void {
    console.error(`[${formatTimestamp()}] ERROR in ${this.taskName}: ${message}`);
  }
}
