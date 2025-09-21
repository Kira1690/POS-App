/**
 * VP3350 Device Service - Focused on VP3350 Bluetooth device integration only
 * Follows Single Responsibility Principle - handles VP3350 device operations exclusively
 */

import {
  VP3350DeviceStatus,
  VP3350DeviceConfig,
  VP3350PaymentResult,
  PaymentError,
} from '@/types/payment.types';
import { showToast } from '@/utils/toast';

export interface VP3350PaymentRequest {
  amount: number;
  orderId: string;
  enableContactless?: boolean;
  enablePin?: boolean;
  timeout?: number;
}

export interface DeviceConnection {
  isConnected: boolean;
  deviceName: string;
  serialNumber: string;
  firmwareVersion: string;
  batteryLevel?: number;
}

export interface IVP3350DeviceService {
  connectDevice(config: VP3350DeviceConfig): Promise<DeviceConnection>;
  disconnectDevice(): Promise<void>;
  processPayment(request: VP3350PaymentRequest): Promise<VP3350PaymentResult>;
  getDeviceStatus(): Promise<VP3350DeviceStatus>;
  testConnection(): Promise<boolean>;
  updateFirmware(): Promise<void>;
}

class VP3350DeviceService implements IVP3350DeviceService {
  private deviceConfig: VP3350DeviceConfig | null = null;
  private deviceStatus: VP3350DeviceStatus = VP3350DeviceStatus.DISCONNECTED;
  private connectionInfo: DeviceConnection | null = null;

  /**
   * Connect to VP3350 Device
   */
  async connectDevice(config: VP3350DeviceConfig): Promise<DeviceConnection> {
    try {
      this.deviceStatus = VP3350DeviceStatus.CONNECTING;
      
      // Validate device configuration
      this.validateDeviceConfig(config);
      
      // Simulate device connection (replace with actual VP3350 SDK integration)
      await this.simulateConnectionDelay();
      
      this.deviceConfig = config;
      this.deviceStatus = VP3350DeviceStatus.CONNECTED;
      
      this.connectionInfo = {
        isConnected: true,
        deviceName: config.deviceName,
        serialNumber: 'VP3350-001234',
        firmwareVersion: '2.1.0',
        batteryLevel: 85,
      };
      
      showToast({
        type: 'success',
        title: 'VP3350 Connected',
        message: `Connected to ${config.deviceName}`,
      });
      
      return this.connectionInfo;
    } catch (error) {
      this.deviceStatus = VP3350DeviceStatus.ERROR;
      throw this.createDeviceError('VP3350_CONNECTION_FAILED', 'Failed to connect to VP3350 device', error);
    }
  }

  /**
   * Disconnect VP3350 Device
   */
  async disconnectDevice(): Promise<void> {
    try {
      this.deviceConfig = null;
      this.connectionInfo = null;
      this.deviceStatus = VP3350DeviceStatus.DISCONNECTED;
      
      showToast({
        type: 'info',
        title: 'VP3350 Disconnected',
        message: 'Payment device disconnected',
      });
    } catch (error) {
      throw this.createDeviceError('VP3350_DISCONNECT_FAILED', 'Failed to disconnect VP3350 device', error);
    }
  }

  /**
   * Process VP3350 Payment
   */
  async processPayment(request: VP3350PaymentRequest): Promise<VP3350PaymentResult> {
    try {
      if (this.deviceStatus !== VP3350DeviceStatus.CONNECTED) {
        throw new Error('VP3350 device not connected');
      }
      
      this.deviceStatus = VP3350DeviceStatus.PROCESSING;
      
      // Validate payment request
      this.validatePaymentRequest(request);
      
      // Simulate VP3350 payment processing (replace with actual SDK calls)
      await this.simulatePaymentProcessing(request.timeout || 30000);
      
      const result: VP3350PaymentResult = {
        success: true,
        transactionId: this.generateTransactionId(),
        authorizationCode: this.generateAuthCode(),
        cardLast4: '1234',
        cardType: 'VISA',
        amount: request.amount,
        currency: 'USD',
        responseCode: '00',
        responseMessage: 'APPROVED',
        processedAt: new Date().toISOString(),
        deviceSerial: this.connectionInfo?.serialNumber || 'VP3350-001234',
        contactlessUsed: Math.random() > 0.5,
        pinVerified: Math.random() > 0.3,
        signatureRequired: Math.random() > 0.7,
      };
      
      this.deviceStatus = VP3350DeviceStatus.READY;
      
      showToast({
        type: 'success',
        title: 'VP3350 Payment Successful',
        message: `Payment of $${request.amount.toFixed(2)} processed successfully`,
      });
      
      return result;
    } catch (error) {
      this.deviceStatus = VP3350DeviceStatus.ERROR;
      throw this.createDeviceError('VP3350_PROCESSING_FAILED', 'VP3350 payment processing failed', error);
    }
  }

  /**
   * Get VP3350 Device Status
   */
  async getDeviceStatus(): Promise<VP3350DeviceStatus> {
    return this.deviceStatus;
  }

  /**
   * Test Device Connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.deviceConfig) {
        return false;
      }
      
      // Simulate connection test
      await this.simulateConnectionDelay(500);
      
      return this.deviceStatus === VP3350DeviceStatus.CONNECTED;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update Device Firmware
   */
  async updateFirmware(): Promise<void> {
    try {
      if (this.deviceStatus !== VP3350DeviceStatus.CONNECTED) {
        throw new Error('Device must be connected to update firmware');
      }
      
      this.deviceStatus = VP3350DeviceStatus.UPDATING;
      
      // Simulate firmware update (5 seconds)
      await this.simulateConnectionDelay(5000);
      
      this.deviceStatus = VP3350DeviceStatus.CONNECTED;
      
      showToast({
        type: 'success',
        title: 'Firmware Updated',
        message: 'VP3350 firmware updated successfully',
      });
    } catch (error) {
      this.deviceStatus = VP3350DeviceStatus.ERROR;
      throw this.createDeviceError('VP3350_FIRMWARE_UPDATE_FAILED', 'Failed to update firmware', error);
    }
  }

  // Private helper methods
  private validateDeviceConfig(config: VP3350DeviceConfig): void {
    if (!config.deviceName) {
      throw new Error('Device name is required');
    }
    if (!config.connectionType) {
      throw new Error('Connection type is required');
    }
  }

  private validatePaymentRequest(request: VP3350PaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    if (!request.orderId) {
      throw new Error('Order ID is required');
    }
  }

  private generateTransactionId(): string {
    return 'VP' + Date.now().toString().substr(-9);
  }

  private generateAuthCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  private async simulateConnectionDelay(ms: number = 2000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async simulatePaymentProcessing(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const processingTime = Math.random() * 3000 + 2000; // 2-5 seconds
      
      if (processingTime > timeout) {
        reject(new Error('Payment processing timeout'));
      } else {
        setTimeout(resolve, processingTime);
      }
    });
  }

  private createDeviceError(code: string, message: string, originalError: any): PaymentError {
    return {
      code,
      message,
      details: originalError,
      recoverable: code !== 'VP3350_FIRMWARE_UPDATE_FAILED',
      userMessage: `VP3350 device error: ${message}`,
    };
  }
}

export const vp3350DeviceService = new VP3350DeviceService();
export default VP3350DeviceService;