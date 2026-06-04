/**
 * Lightweight structured frontend logger.
 * Prefixes every message with a module tag so log entries are easy to filter
 * in the browser DevTools console.
 *
 * Usage:
 *   import { createLogger } from '$lib/logger';
 *   const log = createLogger('READER_ENGINE');
 *   log.info('Node loaded', { nodeId: 42 });
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  module: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

function formatEntry(entry: LogEntry): string {
  return `[${entry.timestamp}] [${entry.module}] [${entry.level.toUpperCase()}] ${entry.message}`;
}

export interface Logger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
  debug(message: string, data?: unknown): void;
}

export function createLogger(module: string): Logger {
  function log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      module,
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    const formatted = formatEntry(entry);

    switch (level) {
      case 'info':
        data !== undefined ? console.info(formatted, data) : console.info(formatted);
        break;
      case 'warn':
        data !== undefined ? console.warn(formatted, data) : console.warn(formatted);
        break;
      case 'error':
        data !== undefined ? console.error(formatted, data) : console.error(formatted);
        break;
      case 'debug':
        data !== undefined ? console.debug(formatted, data) : console.debug(formatted);
        break;
    }
  }

  return {
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
    debug: (msg, data) => log('debug', msg, data),
  };
}

/**
 * Generic API fetch wrapper that logs request lifecycle and surfaces HTTP errors.
 *
 * @param module  Logger module tag (e.g. 'READER_ENGINE')
 * @param url     Endpoint URL
 * @param options Fetch init options
 */
export async function fetchWithLogging<T>(
  module: string,
  url: string,
  options?: RequestInit
): Promise<T> {
  const log = createLogger(module);
  const method = options?.method ?? 'GET';

  log.info(`Fetch initiated → ${method} ${url}`);

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (networkError) {
    log.error(`Network failure → ${method} ${url}`, { error: String(networkError) });
    throw networkError;
  }

  if (!response.ok) {
    log.error(`HTTP ${response.status} ${response.statusText} → ${method} ${url}`);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  let payload: T;
  try {
    payload = (await response.json()) as T;
  } catch (parseError) {
    log.error(`JSON parse failure → ${method} ${url}`, { error: String(parseError) });
    throw parseError;
  }

  log.info(`Fetch success → ${method} ${url} (${response.status})`, payload);
  return payload;
}
