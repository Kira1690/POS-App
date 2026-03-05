// Production-ready native TCP socket implementation
//
// CRITICAL: Do NOT add TurboModuleRegistry.get('TcpSockets') or NativeModules.TcpSockets checks.
// The patched react-native-tcp-socket uses lazy getters that bypass standard module registration.
// Those checks ALWAYS return null with New Architecture + lazy getter patch = permanent false negative.
// This was the root cause of 6 consecutive "connection failed" bugs.
//
// Expo Go detection is handled in TcpSocketWrapper.ts (not here).
// This file matches the working reference: Food-MobileApp-Frontend/paymentprocessor/services/pos/NativeTcpSocket.ts

import TcpSocket from 'react-native-tcp-socket';
import { LoggerFactory } from '../logging/LoggingService';

export interface SocketOptions {
  port: number;
  host: string;
  timeout?: number;
  keepAlive?: boolean;
  nodelay?: boolean;
  localAddress?: string;   // Bind to device's local IP for correct routing on multi-interface devices
  reuseAddress?: boolean;  // Allow rapid reconnections without port wait
  interface?: string;      // Force specific network interface (wifi/cellular)
  localPort?: number;      // Optional local port binding
}

export interface SocketConnection {
  write: (data: string | Buffer, encoding?: string, callback?: (error?: Error) => void) => boolean;
  destroy: () => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
  connect: (options: SocketOptions, callback?: () => void) => void;
}

export interface TcpSocketLib {
  createConnection: (options: SocketOptions, callback?: () => void) => SocketConnection;
  isIP: (input: string) => number;
}

// Native TCP socket implementation
class NativeTcpSocket {
  private tcpSocket: TcpSocketLib | null = null;
  private logger = LoggerFactory.createLogger('NativeTcpSocket');
  private isInitialized = false;

  constructor() {
    this.initializeNativeModule();
  }

  private initializeNativeModule(): void {
    try {
      if (!TcpSocket) {
        throw new Error('react-native-tcp-socket module not available');
      }

      // Trust TcpSocket directly — no registry verification.
      // The patched module resolves native bindings lazily at actual use time.
      this.tcpSocket = TcpSocket as unknown as TcpSocketLib;
      this.isInitialized = true;

      this.logger.info(
        'Native TCP socket module loaded successfully',
        'initializeNativeModule'
      );
    } catch (error) {
      this.logger.warn(
        'Failed to load react-native-tcp-socket module',
        'initializeNativeModule'
      );
      this.tcpSocket = null;
      this.isInitialized = false;
    }
  }

  public isAvailable(): boolean {
    return this.isInitialized && this.tcpSocket !== null;
  }

  public createConnection(options: SocketOptions, callback?: () => void): SocketConnection | null {
    if (!this.isAvailable()) {
      this.logger.error(
        'TCP socket not available - native module not loaded',
        new Error('Native module unavailable'),
        'createConnection'
      );
      return null;
    }

    try {
      const socket = this.tcpSocket!.createConnection(options, callback);

      this.logger.debug('TCP connection created', 'createConnection', {
        host: options.host,
        port: options.port,
        timeout: options.timeout,
        localAddress: options.localAddress,
        reuseAddress: options.reuseAddress,
      });

      return socket;
    } catch (error) {
      this.logger.error(
        'Failed to create TCP connection',
        error instanceof Error ? error : new Error(String(error)),
        'createConnection'
      );
      return null;
    }
  }

  public validateIP(ip: string): boolean {
    if (!this.isAvailable()) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipRegex.test(ip);
    }

    try {
      return this.tcpSocket!.isIP(ip) > 0;
    } catch {
      this.logger.warn('Failed to validate IP using native method, using fallback', 'validateIP');
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipRegex.test(ip);
    }
  }

  public getVersion(): string {
    if (!this.isAvailable()) {
      return 'unavailable';
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const packageInfo = require('react-native-tcp-socket/package.json');
      return packageInfo.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  public getDiagnostics(): { available: boolean; version: string; error?: string } {
    return {
      available: this.isAvailable(),
      version: this.getVersion(),
      error: !this.isAvailable() ? 'react-native-tcp-socket module not available' : undefined
    };
  }
}

// Export singleton instance — NO global pattern, matches reference implementation
export const nativeTcpSocket = new NativeTcpSocket();

// Legacy compatibility exports
export const isTcpSocketAvailable = (): boolean => {
  return nativeTcpSocket.isAvailable();
};

export const createTcpConnection = (options: SocketOptions, callback?: () => void): SocketConnection | null => {
  return nativeTcpSocket.createConnection(options, callback);
};

export default nativeTcpSocket;
