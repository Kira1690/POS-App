/**
 * SimpleTCPTester.ts
 *
 * Dead-simple TCP connection tester — equivalent to: nc -z -w timeout host port
 * NO message sending, NO data exchange — just pure connection test.
 * Tries 3 methods sequentially for maximum compatibility.
 */

import * as Network from 'expo-network';
import { createTcpConnection, SocketConnection } from './TcpSocketWrapper';
import { LoggerFactory } from '../logging/LoggingService';

export interface ConnectionTestResult {
  success: boolean;
  responseTimeMs: number;
  error?: string;
}

export class SimpleTCPTester {
  private logger = LoggerFactory.createLogger('SimpleTCPTester');

  /**
   * Get the device's local IP for socket binding.
   * Consistent with ConnectAndSendService which also binds to localAddress.
   */
  private async getDeviceIP(): Promise<string | undefined> {
    try {
      return await Network.getIpAddressAsync();
    } catch {
      return undefined;
    }
  }

  async testConnection(host: string, port: number, timeoutMs: number = 3000): Promise<ConnectionTestResult> {
    this.logger.debug('Starting TCP connection test', 'testConnection', { host, port, timeoutMs });

    const startTime = Date.now();
    const localAddress = await this.getDeviceIP();

    const methods = [
      () => this.method1_simpleConnect(host, port, timeoutMs, localAddress),
      () => this.method2_quickConnect(host, port, timeoutMs, localAddress),
      () => this.method3_immediateClose(host, port, timeoutMs, localAddress),
    ];

    for (let i = 0; i < methods.length; i++) {
      try {
        const result = await methods[i]();

        if (result.success) {
          const elapsed = Date.now() - startTime;
          this.logger.info(`Connection test passed (method ${i + 1})`, 'testConnection', { host, port, elapsed });
          return { success: true, responseTimeMs: elapsed };
        }
      } catch (error) {
        this.logger.debug(`Method ${i + 1} failed`, 'testConnection', {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      if (i < methods.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    const elapsed = Date.now() - startTime;
    this.logger.warn('All connection methods failed', 'testConnection', { host, port, elapsed });
    return { success: false, responseTimeMs: elapsed, error: `Connection failed after ${methods.length} attempts` };
  }

  private method1_simpleConnect(host: string, port: number, timeoutMs: number, localAddress?: string): Promise<ConnectionTestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let resolved = false;
      let socket: SocketConnection | null = null;

      const timeoutId = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        if (socket) { try { socket.destroy(); } catch { /* ignore */ } }
        resolve({ success: false, responseTimeMs: Date.now() - startTime, error: 'Timeout' });
      }, timeoutMs);

      try {
        socket = createTcpConnection({ host, port, timeout: timeoutMs, localAddress, reuseAddress: true }, () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          const elapsed = Date.now() - startTime;
          if (socket) { try { socket.destroy(); } catch { /* ignore */ } }
          resolve({ success: true, responseTimeMs: elapsed });
        });

        if (!socket) {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          resolve({ success: false, responseTimeMs: Date.now() - startTime, error: 'Socket creation failed' });
          return;
        }

        socket.on('error', (error: unknown) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          if (socket) { try { socket.destroy(); } catch { /* ignore */ } }
          resolve({ success: false, responseTimeMs: Date.now() - startTime, error: error instanceof Error ? error.message : String(error) });
        });

        socket.on('timeout', () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          if (socket) { try { socket.destroy(); } catch { /* ignore */ } }
          resolve({ success: false, responseTimeMs: Date.now() - startTime, error: 'Socket timeout' });
        });
      } catch (error) {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        resolve({ success: false, responseTimeMs: Date.now() - startTime, error: error instanceof Error ? error.message : String(error) });
      }
    });
  }

  private method2_quickConnect(host: string, port: number, timeoutMs: number, localAddress?: string): Promise<ConnectionTestResult> {
    return this.method1_simpleConnect(host, port, Math.floor(timeoutMs / 2), localAddress);
  }

  private method3_immediateClose(host: string, port: number, timeoutMs: number, localAddress?: string): Promise<ConnectionTestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let resolved = false;
      let socket: SocketConnection | null = null;

      const timeoutId = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        if (socket) { try { socket.destroy(); } catch { /* ignore */ } }
        resolve({ success: false, responseTimeMs: Date.now() - startTime, error: 'Timeout' });
      }, timeoutMs);

      try {
        socket = createTcpConnection({ host, port, timeout: timeoutMs, localAddress, reuseAddress: true }, () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          const elapsed = Date.now() - startTime;
          if (socket) { socket.destroy(); }
          setTimeout(() => {
            resolve({ success: true, responseTimeMs: elapsed });
          }, 50);
        });

        if (!socket) {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          resolve({ success: false, responseTimeMs: Date.now() - startTime, error: 'Socket creation failed' });
          return;
        }

        socket.on('error', (error: unknown) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          if (socket) { try { socket.destroy(); } catch { /* ignore */ } }
          resolve({ success: false, responseTimeMs: Date.now() - startTime, error: error instanceof Error ? error.message : String(error) });
        });
      } catch (error) {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        resolve({ success: false, responseTimeMs: Date.now() - startTime, error: error instanceof Error ? error.message : String(error) });
      }
    });
  }

  async validateTerminal(host: string, port: number, retries: number = 2): Promise<ConnectionTestResult> {
    this.logger.info('Validating terminal', 'validateTerminal', { host, port, retries });

    for (let attempt = 1; attempt <= retries; attempt++) {
      const result = await this.testConnection(host, port, 3000);

      if (result.success) {
        this.logger.info('Terminal validated', 'validateTerminal', { host, port, responseTimeMs: result.responseTimeMs });
        return result;
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    this.logger.warn('Terminal validation failed', 'validateTerminal', { host, port, retries });
    return { success: false, responseTimeMs: 0, error: `Failed after ${retries} validation attempts` };
  }
}
