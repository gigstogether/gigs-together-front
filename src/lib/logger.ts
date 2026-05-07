type LogLevel = 'info' | 'warn' | 'error';

export type LogMeta = Readonly<Record<string, unknown>>;

interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly meta?: LogMeta;
}

function toErrorMeta(error: unknown): LogMeta {
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

function writeLog(level: LogLevel, message: string, meta?: LogMeta): void {
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
    writeLog('error', message, {
      ...meta,
      error: toErrorMeta(error),
    });
  },
};
