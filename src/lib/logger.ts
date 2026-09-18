import { clientEnv } from '@/env/client-env';
import { ApiError, ApiNetworkError, ApiRequestError } from '@/lib/api-errors';

type LogLevel = 'info' | 'warn' | 'error';

export type LogMeta = Readonly<Record<string, unknown>>;

interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly meta?: LogMeta;
}

function toErrorMeta(error: unknown): LogMeta {
  if (error instanceof ApiRequestError) {
    return {
      name: error.name,
      message: error.message,
      endpointOrUrl: error.endpointOrUrl,
      method: error.method,
      ...(error.statusCode === undefined ? {} : { statusCode: error.statusCode }),
      stack: error.stack,
    };
  }

  if (error instanceof ApiError) {
    return {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      ...(error.code ? { code: error.code } : {}),
      stack: error.stack,
    };
  }

  if (error instanceof ApiNetworkError) {
    return {
      name: error.name,
      message: error.message,
      method: error.method,
      url: error.url,
      cause: toErrorMeta(error.cause),
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    value: error,
  };
}

function toLogPayload(level: LogLevel, message: string, meta?: LogMeta): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
}

function formatBrowserMessage(message: string): string {
  const words = message.split('_').filter(Boolean);
  if (words.length === 0) {
    return message;
  }

  const formatted = words.map((word) => (word === 'api' ? 'API' : word)).join(' ');
  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
}

function writeBrowserLog(level: LogLevel, message: string, meta?: LogMeta): void {
  const formattedMessage = formatBrowserMessage(message);

  if (level === 'error') {
    if (meta) {
      console.error(formattedMessage, meta);
    } else {
      console.error(formattedMessage);
    }
    return;
  }

  if (level === 'warn') {
    if (meta) {
      console.warn(formattedMessage, meta);
    } else {
      console.warn(formattedMessage);
    }
    return;
  }

  if (meta) {
    console.info(formattedMessage, meta);
  } else {
    console.info(formattedMessage);
  }
}

function writeBrowserErrorFromUnknown(message: string, error: unknown, meta?: LogMeta): void {
  const formattedMessage = formatBrowserMessage(message);
  const errorMessage = error instanceof Error ? error.message.trim() : '';
  const httpStatus = error instanceof ApiError ? ` (HTTP ${error.statusCode})` : '';
  const summary = errorMessage
    ? `${formattedMessage}${httpStatus}: ${errorMessage}`
    : `${formattedMessage}${httpStatus}`;

  console.error(summary, {
    ...meta,
    error,
  });
}

function writeLog(level: LogLevel, message: string, meta?: LogMeta): void {
  if (typeof window !== 'undefined' || clientEnv.isDevelopment) {
    writeBrowserLog(level, message, meta);
    return;
  }

  const payload = toLogPayload(level, message, meta);
  const serialized = (() => {
    try {
      return JSON.stringify(payload);
    } catch {
      return JSON.stringify({
        level,
        message: 'logger_serialization_failed',
        timestamp: new Date().toISOString(),
      });
    }
  })();

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  if (level === 'warn') {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}

export const logger = {
  info: (message: string, meta?: LogMeta): void => {
    writeLog('info', message, meta);
  },
  warn: (message: string, meta?: LogMeta): void => {
    writeLog('warn', message, meta);
  },
  error: (message: string, meta?: LogMeta): void => {
    writeLog('error', message, meta);
  },
  errorFromUnknown: (message: string, error: unknown, meta?: LogMeta): void => {
    if (typeof window !== 'undefined' || clientEnv.isDevelopment) {
      writeBrowserErrorFromUnknown(message, error, meta);
      return;
    }

    writeLog('error', message, {
      ...meta,
      error: toErrorMeta(error),
    });
  },
};
