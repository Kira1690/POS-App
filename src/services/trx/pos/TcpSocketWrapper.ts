// Production TCP Socket Wrapper - No demo fallbacks
// This module provides native TCP socket functionality for production deployment

import { nativeTcpSocket } from './NativeTcpSocket';
import { LoggerFactory } from '../logging/LoggingService';

export interface SocketConnection {
  write: (data: string | Buffer, encoding?: string, callback?: (error?: Error) => void) => boolean;
  destroy: () => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
  connect: (options: SocketOptions, callback?: () => void) => void;
}

export interface SocketOptions {
  port: number;
  host: string;
  timeout?: number;
  keepAlive?: boolean;
  nodelay?: boolean;
  localAddress?: string;
  reuseAddress?: boolean;
  interface?: string;
  localPort?: number;
}

const logger = LoggerFactory.createLogger('TcpSocketWrapper');

// Check if we're in an environment that supports native modules
function isDevelopmentEnvironment(): boolean {
  // Skip Expo Go detection — rely on native module availability instead.
  // The nativeTcpSocket.isAvailable() check in isTcpSocketAvailable()
  // handles the case where the native module is not present.
  return true;
}

export const isTcpSocketAvailable = (): boolean => {
  const envSupported = isDevelopmentEnvironment();
  const moduleAvailable = nativeTcpSocket.isAvailable();

  if (!envSupported) {
    logger.warn('TCP sockets not supported in current environment', 'isTcpSocketAvailable');
    return false;
  }

  if (!moduleAvailable) {
    logger.error('react-native-tcp-socket module not available', new Error('Module not found'), 'isTcpSocketAvailable');
    return false;
  }

  return true;
};

export const createTcpConnection = (options: SocketOptions, callback?: () => void): SocketConnection | null => {
  if (!isTcpSocketAvailable()) {
    logger.error(
      'Cannot create TCP connection - native socket not available',
      new Error('TCP socket unavailable'),
      'createTcpConnection'
    );
    return null;
  }

  logger.debug('Creating TCP connection', 'createTcpConnection', {
    host: options.host,
    port: options.port,
    localAddress: options.localAddress || 'not set',
    reuseAddress: options.reuseAddress || false,
  });

  return nativeTcpSocket.createConnection(options, callback);
};

export const validateIPAddress = (ip: string): boolean => {
  return nativeTcpSocket.validateIP(ip);
};

export const getTcpSocketDiagnostics = () => {
  return {
    ...nativeTcpSocket.getDiagnostics(),
    environmentSupported: isDevelopmentEnvironment()
  };
};

// Production-ready error handling - no fallbacks to demo mode
export const requireTcpSocket = (): void => {
  if (!isTcpSocketAvailable()) {
    const diagnostics = getTcpSocketDiagnostics();
    const errorMessage = `TCP socket is required for production operation but is not available.
      Environment supported: ${diagnostics.environmentSupported},
      Module available: ${diagnostics.available},
      Version: ${diagnostics.version}`;

    logger.error(errorMessage, new Error('TCP socket unavailable'), 'requireTcpSocket');
    throw new Error(errorMessage);
  }
};

export default nativeTcpSocket;
