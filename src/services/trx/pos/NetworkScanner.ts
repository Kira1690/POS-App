import * as Network from 'expo-network';
import { validateIPAddress } from './TcpSocketWrapper';
import { LoggerFactory } from '../logging/LoggingService';
import { SimpleTCPTester } from './SimpleTCPTester';

export interface TerminalDevice {
  ip: string;
  port: number;
  isOnline: boolean;
  responseTime?: number;
}

export class NetworkScanner {
  private logger = LoggerFactory.createLogger('NetworkScanner');
  private tcpTester = new SimpleTCPTester();
  private readonly defaultPort = 1180;
  private readonly timeout = 3000;

  private async getCurrentNetwork(): Promise<{ ip: string; subnet: string } | null> {
    try {
      const ipAddress = await this.getDeviceIPAddress();
      if (!ipAddress) {
        this.logger.warn('Unable to get device IP address from any method', 'getCurrentNetwork');
        return null;
      }

      const ipParts = ipAddress.split('.');
      if (ipParts.length !== 4) {
        this.logger.warn('Invalid IP address format', 'getCurrentNetwork', { ip: ipAddress });
        return null;
      }

      const subnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
      console.log('📍 Device IP:', ipAddress);
      console.log('📍 Subnet:', subnet + '.0/24');

      this.logger.info('Current network detected', 'getCurrentNetwork', {
        deviceIP: ipAddress,
        subnet: subnet + '.0/24'
      });

      return { ip: ipAddress, subnet };
    } catch (error) {
      this.logger.error('Failed to get network information', error instanceof Error ? error : new Error(String(error)), 'getCurrentNetwork');
      return null;
    }
  }

  private async getDeviceIPAddress(): Promise<string | null> {
    // Method 1: expo-network
    try {
      const ipAddress = await Network.getIpAddressAsync();
      if (ipAddress && this.isValidIPAddress(ipAddress)) {
        this.logger.info('Device IP obtained via expo-network', 'getDeviceIPAddress', { ip: ipAddress });
        return ipAddress;
      }
    } catch (error) {
      this.logger.debug('expo-network failed', 'getDeviceIPAddress', {
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Method 2: WebRTC
    try {
      const ipAddress = await this.getIPViaWebRTC();
      if (ipAddress && this.isValidIPAddress(ipAddress)) {
        this.logger.info('Device IP obtained via WebRTC', 'getDeviceIPAddress', { ip: ipAddress });
        return ipAddress;
      }
    } catch (error) {
      this.logger.debug('WebRTC method failed', 'getDeviceIPAddress', {
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Method 3: Fallback networks
    const commonNetworks = ['192.168.1', '192.168.0', '10.0.0', '10.236.1', '172.16.0'];
    for (const network of commonNetworks) {
      this.logger.info(`Fallback: Assuming device is on network ${network}.0/24`, 'getDeviceIPAddress');
      return `${network}.100`;
    }

    return null;
  }

  private async getIPViaWebRTC(): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        if (typeof RTCPeerConnection === 'undefined') { resolve(null); return; }
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) { resolved = true; pc.close(); resolve(null); }
        }, 3000);
        pc.createDataChannel('');
        pc.createOffer().then((offer) => pc.setLocalDescription(offer));
        pc.onicecandidate = (ice) => {
          if (!resolved && ice.candidate) {
            const parts = ice.candidate.candidate.split(' ');
            if (parts.length >= 5) {
              const ip = parts[4];
              if (this.isValidIPAddress(ip) && !ip.startsWith('169.254')) {
                resolved = true;
                clearTimeout(timeout);
                pc.close();
                resolve(ip);
              }
            }
          }
        };
      } catch { resolve(null); }
    });
  }

  private isValidIPAddress(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip) && !ip.startsWith('127.') && !ip.startsWith('169.254.');
  }

  private async testTerminalConnection(ip: string, port: number): Promise<TerminalDevice> {
    try {
      const result = await this.tcpTester.testConnection(ip, port, this.timeout);
      if (result.success) {
        this.logger.debug('Terminal found', 'testTerminalConnection', { ip, port, responseTime: `${result.responseTimeMs}ms` });
        return { ip, port, isOnline: true, responseTime: result.responseTimeMs };
      }
      return { ip, port, isOnline: false };
    } catch {
      return { ip, port, isOnline: false };
    }
  }

  private isValidTerminalIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    const [a, b, c, d] = parts.map(Number);
    const commonRanges: [number, number, number, number[]][] = [
      [192, 168, 1, [100, 101, 102, 200, 201]],
      [192, 168, 0, [100, 101, 102, 200, 201]],
      [10, 0, 0, [100, 101, 102, 200, 201]],
      [192, 168, 1, [50, 51, 52, 53, 54]],
      [192, 168, 0, [50, 51, 52, 53, 54]]
    ];
    return commonRanges.some(([ra, rb, rc, rdArray]) => a === ra && b === rb && c === rc && rdArray.includes(d));
  }

  async scanForTerminals(port: number = this.defaultPort): Promise<TerminalDevice[]> {
    console.log('🔎 TERMINAL SCAN: Starting network scan for POS terminals');
    console.log('📡 Scanning port:', port);

    this.logger.info('Starting network scan for POS terminals', 'scanForTerminals', { port });

    const network = await this.getCurrentNetwork();
    if (!network) {
      this.logger.error('Cannot scan - network information unavailable', new Error('No network'), 'scanForTerminals');
      return [];
    }

    const { subnet } = network;
    const foundTerminals: TerminalDevice[] = [];

    const priorityIPs = [
      network.ip,
      `${subnet}.100`, `${subnet}.101`, `${subnet}.102`,
      `${subnet}.126`, `${subnet}.127`, `${subnet}.128`,
      `${subnet}.129`, `${subnet}.130`,
      `${subnet}.200`, `${subnet}.201`,
      `${subnet}.50`, `${subnet}.51`, `${subnet}.52`
    ];

    const uniquePriorityIPs = [...new Set(priorityIPs)];

    this.logger.info('Scanning priority IP addresses', 'scanForTerminals', {
      subnet: subnet + '.0/24',
      deviceIP: network.ip,
      priorityIPs: uniquePriorityIPs.length,
    });

    const priorityPromises = uniquePriorityIPs.map(ip => this.testTerminalConnection(ip, port));
    const priorityResults = await Promise.all(priorityPromises);

    priorityResults.forEach(result => {
      if (result.isOnline) {
        foundTerminals.push(result);
        this.logger.info('POS Terminal discovered!', 'scanForTerminals', { ip: result.ip, port: result.port, responseTime: result.responseTime });
      }
    });

    if (foundTerminals.length === 0) {
      this.logger.info('No terminals found in priority list, expanding search', 'scanForTerminals');

      const extendedIPs: string[] = [];
      const deviceLastOctet = parseInt(network.ip.split('.')[3], 10);

      for (let i = Math.max(1, deviceLastOctet - 20); i <= Math.min(254, deviceLastOctet + 20); i++) {
        const ip = `${subnet}.${i}`;
        if (!uniquePriorityIPs.includes(ip)) extendedIPs.push(ip);
      }

      for (let i = 1; i <= 254; i++) {
        const ip = `${subnet}.${i}`;
        if (!uniquePriorityIPs.includes(ip) && !extendedIPs.includes(ip) && this.isValidTerminalIP(ip)) {
          extendedIPs.push(ip);
        }
      }

      const limitedExtendedIPs = extendedIPs.slice(0, 100);

      const extendedPromises = limitedExtendedIPs.map(ip => this.testTerminalConnection(ip, port));
      const extendedResults = await Promise.all(extendedPromises);

      extendedResults.forEach(result => {
        if (result.isOnline) {
          foundTerminals.push(result);
          this.logger.info('Additional POS Terminal discovered!', 'scanForTerminals', { ip: result.ip, port: result.port });
        }
      });
    }

    this.logger.info('Network scan completed', 'scanForTerminals', {
      terminalsFound: foundTerminals.length,
      terminals: foundTerminals.map(t => ({ ip: t.ip, responseTime: t.responseTime }))
    });

    return foundTerminals;
  }

  async testSingleTerminal(ip: string, port: number = this.defaultPort): Promise<TerminalDevice> {
    this.logger.info('Testing single terminal', 'testSingleTerminal', { ip, port });
    return await this.testTerminalConnection(ip, port);
  }

  async addManualTerminal(ip: string, port: number = this.defaultPort): Promise<TerminalDevice | null> {
    this.logger.info('Adding manual terminal', 'addManualTerminal', { ip, port });

    if (!validateIPAddress(ip)) {
      this.logger.error('Invalid IP address format', new Error('Invalid IP'), 'addManualTerminal', { ip });
      return null;
    }

    try {
      const terminal = await this.testTerminalConnection(ip, port);
      return terminal;
    } catch (error) {
      this.logger.error('Failed to add manual terminal', error instanceof Error ? error : new Error(String(error)), 'addManualTerminal', { ip, port });
      return null;
    }
  }

  /**
   * Test a manual IP address with retry-based validation.
   * Uses SimpleTCPTester.validateTerminal with multiple retries × 3 methods
   * for maximum reliability (matches reference TerminalManager approach).
   */
  async testManualIP(ip: string, port: number = this.defaultPort): Promise<TerminalDevice | null> {
    console.log('');
    console.log('[NetworkScanner] MANUAL IP TEST (with retries)');
    console.log(`[NetworkScanner] Testing: ${ip}:${port}`);

    if (!this.isValidIPAddress(ip)) {
      console.log('[NetworkScanner] Invalid IP address format');
      return null;
    }

    // Use validateTerminal — 2 retries × 3 methods = 6 total attempts
    const result = await this.tcpTester.validateTerminal(ip, port, 2);

    if (result.success) {
      this.logger.info('Manual IP test successful', 'testManualIP', {
        ip, port, responseTime: result.responseTimeMs,
      });
      console.log(`[NetworkScanner] SUCCESS — ${ip}:${port} responded in ${result.responseTimeMs}ms`);
      return { ip, port, isOnline: true, responseTime: result.responseTimeMs };
    }

    this.logger.warn('Manual IP test failed', 'testManualIP', {
      ip, port, error: result.error,
    });
    console.log(`[NetworkScanner] FAILED — ${result.error}`);
    return null;
  }

  async comprehensiveScan(port: number = this.defaultPort, manualIPs: string[] = []): Promise<TerminalDevice[]> {
    this.logger.info('Starting comprehensive terminal scan', 'comprehensiveScan', { port, manualIPs: manualIPs.length });

    const foundTerminals: TerminalDevice[] = [];

    try {
      const autoDiscovered = await this.scanForTerminals(port);
      foundTerminals.push(...autoDiscovered);
    } catch (error) {
      this.logger.warn('Automatic discovery failed, continuing with manual IPs', 'comprehensiveScan', {
        error: error instanceof Error ? error.message : String(error)
      });
    }

    if (manualIPs.length > 0) {
      const manualPromises = manualIPs.map(ip => this.addManualTerminal(ip, port));
      const manualResults = await Promise.all(manualPromises);
      manualResults.forEach(result => {
        if (result && !foundTerminals.some(t => t.ip === result.ip && t.port === result.port)) {
          foundTerminals.push(result);
        }
      });
    }

    this.logger.info('Comprehensive scan completed', 'comprehensiveScan', { terminalsFound: foundTerminals.length });
    return foundTerminals;
  }
}
