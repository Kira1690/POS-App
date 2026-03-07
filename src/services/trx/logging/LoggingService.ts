/**
 * TRX LoggingService
 * Context-aware logger for TRX payment terminal integration
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, context?: string): void;
  info(message: string, context?: string): void;
  warn(message: string, context?: string): void;
  error(message: string, errorOrContext?: Error | string, context?: string): void;
}

class ConsoleLogger implements ILogger {
  private context: string;
  private readonly prefix = '[TRX]';

  constructor(context: string) {
    this.context = context;
  }

  debug(_message: string, _context?: string): void {
    // DEBUG suppressed — too verbose for JS bridge
  }

  info(message: string, context?: string): void {
    if (!__DEV__) return;
    const ctx = context || this.context;
    console.log(`${this.prefix}[INFO][${ctx}] ${message}`);
  }

  warn(message: string, context?: string): void {
    if (!__DEV__) return;
    const ctx = context || this.context;
    console.warn(`${this.prefix}[WARN][${ctx}] ${message}`);
  }

  error(message: string, errorOrContext?: Error | string, context?: string): void {
    if (!__DEV__) return;
    const ctx = context || this.context;
    if (errorOrContext instanceof Error) {
      console.error(`${this.prefix}[ERROR][${ctx}] ${message}`, errorOrContext.message);
    } else {
      console.error(`${this.prefix}[ERROR][${ctx}] ${message}`);
    }
  }
}

/**
 * Singleton LoggingService for backward compatibility
 */
export class LoggingService {
  private static instance: LoggingService;
  private logger: ConsoleLogger;

  private constructor() {
    this.logger = new ConsoleLogger('LoggingService');
  }

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, context);
  }

  info(message: string, context?: string): void {
    this.logger.info(message, context);
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, context);
  }

  error(message: string, errorOrContext?: Error | string, context?: string): void {
    this.logger.error(message, errorOrContext, context);
  }
}

/**
 * Factory to create context-aware loggers
 */
export class LoggerFactory {
  static createLogger(context: string): ILogger {
    return new ConsoleLogger(context);
  }
}
