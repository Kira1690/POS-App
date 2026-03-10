import { Buffer } from 'buffer';
import * as Network from 'expo-network';
import { LoggerFactory } from '../logging/LoggingService';
import { createTcpConnection, SocketConnection, SocketOptions } from './TcpSocketWrapper';

export interface ConnectionConfig {
  host: string;
  port: number;
  sendTimeout: number;
  receiveTimeout: number;
}

export interface MessageResponse {
  success: boolean;
  data?: string;
  error?: string;
  responseTime: number;
}

export class ConnectAndSendService {
  private logger = LoggerFactory.createLogger('ConnectAndSendService');

  /**
   * Connect to terminal, send message, receive response, and close connection
   * This implements the connect-and-send pattern from C# code
   */
  async connectAndSend(config: ConnectionConfig, messageData: Uint8Array): Promise<MessageResponse> {
    const startTime = Date.now();

    const messagePrintable = this.removeNonPrintables(messageData);
    const messageHex = Array.from(messageData).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

    this.logger.info('Starting connect-and-send operation', 'connectAndSend', {
      host: config.host,
      port: config.port,
      messageLength: messageData.length,
      sendTimeout: config.sendTimeout,
      receiveTimeout: config.receiveTimeout,
      messagePrintable,
      messageHex: messageHex.substring(0, 100) + (messageHex.length > 100 ? '...' : '')
    });

    let client: SocketConnection | null = null;
    let stream: SocketConnection | null = null;

    try {
      this.logger.debug(`Opening IP Port ${config.host}:${config.port}`, 'connectAndSend');

      const connection = await this.createTcpClient(config);
      client = connection.client;
      stream = connection.stream;

      const printableMessage = this.removeNonPrintables(messageData);
      this.logger.info(`Sending ${printableMessage}`, 'connectAndSend');

      if (__DEV__) {
        console.log(`[TRX] Sending to ${config.host}:${config.port} (${messageData.length} bytes)`);
      }

      // CRITICAL FIX: Start listening for response BEFORE sending (matches C# pattern)
      const responsePromise = this.readFromStream(stream, config.receiveTimeout);

      await this.writeToStream(stream, messageData, config.sendTimeout);

      const responseData = await responsePromise;

      const printableResponse = this.removeNonPrintables(responseData);
      this.logger.info(`Received ${printableResponse}`, 'connectAndSend');

      const responseString = this.bytesToString(responseData);
      const responseTime = Date.now() - startTime;

      this.logger.info('Connect-and-send completed successfully', 'connectAndSend', {
        responseTime: `${responseTime}ms`,
        responseLength: responseData.length
      });

      return {
        success: true,
        data: responseString,
        responseTime
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('Connect-and-send failed', error instanceof Error ? error : new Error(String(error)), 'connectAndSend', {
        host: config.host,
        port: config.port,
        responseTime: `${responseTime}ms`
      });

      return {
        success: false,
        error: errorMessage,
        responseTime
      };

    } finally {
      try {
        if (stream) {
          await this.closeStream(stream);
          this.logger.debug('Stream closed', 'connectAndSend');
        }
        if (client) {
          await this.closeClient(client);
          this.logger.debug('Client closed', 'connectAndSend');
        }
      } catch (closeError) {
        this.logger.warn('Error closing connection', 'connectAndSend', {
          error: closeError instanceof Error ? closeError.message : String(closeError)
        });
      }
    }
  }

  private async getDeviceIPAddress(): Promise<string | undefined> {
    try {
      const deviceIP = await Network.getIpAddressAsync();
      this.logger.debug('Device IP for socket binding', 'getDeviceIPAddress', { deviceIP });
      return deviceIP;
    } catch (error) {
      this.logger.warn('Failed to get device IP — socket will use default routing', 'getDeviceIPAddress', {
        error: error instanceof Error ? error.message : String(error)
      });
      return undefined;
    }
  }

  private async createTcpClient(config: ConnectionConfig): Promise<{ client: SocketConnection; stream: SocketConnection }> {
    const deviceIP = await this.getDeviceIPAddress();

    return new Promise((resolve, reject) => {
      const options: SocketOptions = {
        host: config.host,
        port: config.port,
        timeout: config.sendTimeout,
        localAddress: deviceIP,
        reuseAddress: true,
      };

      this.logger.debug('Creating TCP client', 'createTcpClient', {
        host: config.host,
        port: config.port,
        localAddress: deviceIP || 'default',
        reuseAddress: true,
      });

      const client = createTcpConnection(options, () => {
        if (client) {
          resolve({ client, stream: client });
        } else {
          reject(new Error('Failed to create client connection'));
        }
      });

      if (!client) {
        reject(new Error(
          'TCP socket unavailable — requires a custom dev build, not Expo Go. ' +
          `Run: eas build --profile development --platform android (target: ${config.host}:${config.port})`
        ));
        return;
      }

      client.on('error', (error: unknown) => {
        reject(error);
      });

      client.on('timeout', () => {
        reject(new Error(`Connection timeout to ${config.host}:${config.port}`));
      });
    });
  }

  private async writeToStream(stream: SocketConnection, data: Uint8Array, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Send timeout after ${timeout}ms`));
      }, timeout);

      try {
        const buffer = Buffer.from(data);
        const success = stream.write(buffer, 'binary', (error) => {
          clearTimeout(timeoutId);
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });

        if (!success) {
          stream.on('drain', () => {
            clearTimeout(timeoutId);
            resolve();
          });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Read data from stream - EXACT C# equivalent with complete message buffering
   * Buffers chunks until we receive a complete MML message (STX...ETX...LRC)
   */
  private async readFromStream(stream: SocketConnection, timeout: number): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      let responseStartTime: number | null = null;
      let isResolved = false;

      const timeoutId = setTimeout(() => {
        if (isResolved) return;
        isResolved = true;
        if (__DEV__) {
          console.log(`[TRX] Timeout after ${timeout}ms`);
        }
        reject(new Error(`Receive timeout after ${timeout}ms - Terminal not responding. Customer may need more time to insert card.`));
      }, timeout);

      // Buffer to store response bytes - EXACT C# equivalent (8192 bytes)
      const responseBuffer = Buffer.alloc(8192);
      let totalBytesRead = 0;

      const onData = (data: unknown) => {
        if (isResolved) return;

        if (!responseStartTime) {
          responseStartTime = Date.now();
        }

        let dataBuffer: Buffer;
        if (Buffer.isBuffer(data)) {
          dataBuffer = data as Buffer;
        } else if (typeof data === 'string') {
          dataBuffer = Buffer.from(data, 'binary');
        } else {
          dataBuffer = Buffer.from(data as Uint8Array);
        }

        const bytesToCopy = Math.min(dataBuffer.length, 8192 - totalBytesRead);
        dataBuffer.copy(responseBuffer, totalBytesRead, 0, bytesToCopy);
        totalBytesRead += bytesToCopy;

        // Check if we have a complete MML message: <STX>...<ETX><LRC>
        if (totalBytesRead >= 8) {
          const hasSTX = responseBuffer[0] === 0x02;
          const hasETX = responseBuffer[totalBytesRead - 2] === 0x03;

          if (hasSTX && hasETX) {
            isResolved = true;
            clearTimeout(timeoutId);
            stream.off('data', onData);
            stream.off('error', onError);
            stream.off('close', onClose);

            const actualData = responseBuffer.subarray(0, totalBytesRead);
            if (__DEV__) {
              console.log(`[TRX] Response received (${totalBytesRead} bytes)`);
            }
            resolve(new Uint8Array(actualData));
          }
        }
      };

      const onError = (error: unknown) => {
        if (isResolved) return;
        isResolved = true;
        if (__DEV__) {
          console.log('[TRX] Connection error:', error instanceof Error ? error.message : String(error));
        }
        clearTimeout(timeoutId);
        stream.off('data', onData);
        stream.off('error', onError);
        stream.off('close', onClose);
        reject(error instanceof Error ? error : new Error(String(error)));
      };

      const onClose = () => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timeoutId);
        stream.off('data', onData);
        stream.off('error', onError);
        stream.off('close', onClose);
        reject(new Error('Connection closed by terminal before receiving response'));
      };

      stream.on('data', onData);
      stream.on('error', onError);
      stream.on('close', onClose);
    });
  }

  private async closeStream(stream: SocketConnection): Promise<void> {
    return new Promise((resolve) => {
      try {
        stream.destroy();
        resolve();
      } catch {
        resolve();
      }
    });
  }

  private async closeClient(client: SocketConnection): Promise<void> {
    return new Promise((resolve) => {
      try {
        client.destroy();
        resolve();
      } catch {
        resolve();
      }
    });
  }

  private removeNonPrintables(data: Uint8Array): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      if (byte >= 32 && byte <= 126) {
        result += String.fromCharCode(byte);
      } else {
        result += `[${byte.toString(16).padStart(2, '0').toUpperCase()}]`;
      }
    }
    return result;
  }

  private bytesToString(data: Uint8Array): string {
    return new TextDecoder('utf-8').decode(data);
  }

  async testConnection(host: string, port: number, timeout: number = 36000): Promise<boolean> {
    this.logger.debug('Testing connection with localAddress binding', 'testConnection', { host, port, timeout });

    try {
      const config: ConnectionConfig = {
        host,
        port,
        sendTimeout: timeout,
        receiveTimeout: timeout
      };

      // createTcpClient now automatically binds to device IP
      const { client, stream } = await this.createTcpClient(config);

      await this.closeStream(stream);
      await this.closeClient(client);

      this.logger.debug('Connection test successful', 'testConnection', { host, port });
      return true;

    } catch (error) {
      this.logger.debug('Connection test failed', 'testConnection', {
        host,
        port,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}
