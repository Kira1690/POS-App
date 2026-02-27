import { LoggerFactory } from '../logging/LoggingService';

export interface SaleRequest {
  transactionId: string;
  amount: number;
  tax?: number;
  level2Data?: Level2Data;
  industryData?: IndustryData;
  accountData?: AccountData;
  clientId?: string;
}

export interface Level2Data {
  localTaxAmount?: number;
  customerCode?: string;
}

export interface BalanceRequest {
  transactionId: string;
}

export interface IndustryData {
  industry?: string;
  marketSpecificId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  noShow?: boolean;
  dailyRate?: number;
  stayDuration?: number;
}

export interface AccountData {
  description?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  address2?: string;
  city?: string;
  postal?: string;
  country?: string;
  region?: string;
  phone?: string;
  cellPhone?: string;
  cellCarrier?: string;
  email?: string;
}

export class MMLMessageBuilder {
  private logger = LoggerFactory.createLogger('MMLMessageBuilder');

  /**
   * Build a SALE message according to the MML protocol
   * Format: <STX>SALE|TranId|Amount|Level2orLevel3Data|IndustryData|AccountData|ClientId<ETX><LRC>
   */
  buildSaleMessage(request: SaleRequest): Uint8Array {
    this.logger.info('Building SALE message', 'buildSaleMessage', {
      transactionId: request.transactionId,
      amount: request.amount,
      tax: request.tax,
    });

    const parts = [
      'SALE',
      `ID:${request.transactionId}`,
      request.amount.toFixed(2)
    ];

    if (request.level2Data) {
      parts.push(this.buildLevel2DataMML(request.level2Data));
    } else {
      parts.push('');
    }

    if (request.industryData) {
      parts.push(this.buildIndustryDataMML(request.industryData));
    } else {
      parts.push('');
    }

    if (request.accountData) {
      parts.push(this.buildAccountDataMML(request.accountData));
    } else {
      parts.push('');
    }

    if (request.clientId) {
      parts.push(request.clientId);
    }

    const messageContent = parts.join('|');
    const fullMessage = this.wrapWithProtocol(messageContent);

    const messageHex = Array.from(fullMessage).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

    this.logger.debug('SALE message built', 'buildSaleMessage', {
      messageLength: fullMessage.length,
      content: this.bytesToPrintable(fullMessage),
      messageContent,
      messageHex: messageHex.substring(0, 150) + (messageHex.length > 150 ? '...' : '')
    });

    console.log('🔨 ============================================');
    console.log('🔨 MML MESSAGE CONSTRUCTED');
    console.log('🔨 ============================================');
    console.log('📝 Transaction ID:', request.transactionId);
    console.log('📝 Amount:', request.amount.toFixed(2));
    console.log('📝 Tax:', request.tax?.toFixed(2) || 'N/A');
    console.log('📝 Message Content:', messageContent);
    console.log('📝 Message Length:', fullMessage.length, 'bytes');
    console.log('📝 Printable:', this.bytesToPrintable(fullMessage));
    console.log('📝 Hex Dump:', messageHex);
    console.log('🔨 ============================================');

    return fullMessage;
  }

  /**
   * Build a BALANCE message according to the MML protocol
   * Format: <STX>BALANCE|TranId<ETX><LRC>
   */
  buildBalanceMessage(request: BalanceRequest): Uint8Array {
    this.logger.info('Building BALANCE message', 'buildBalanceMessage', {
      transactionId: request.transactionId
    });

    const messageContent = `BALANCE|ID:${request.transactionId}`;
    const fullMessage = this.wrapWithProtocol(messageContent);

    this.logger.debug('BALANCE message built', 'buildBalanceMessage', {
      messageLength: fullMessage.length,
      content: this.bytesToPrintable(fullMessage)
    });

    return fullMessage;
  }

  private buildLevel2DataMML(data: Level2Data): string {
    const elements: string[] = [];
    if (data.localTaxAmount !== undefined) {
      elements.push(`<Z2>${data.localTaxAmount.toFixed(2)}</Z2>`);
    }
    if (data.customerCode) {
      elements.push(`<L1>${data.customerCode}</L1>`);
    }
    if (elements.length === 0) return '';
    return `<j1>${elements.join('')}</j1>`;
  }

  private buildIndustryDataMML(data: IndustryData): string {
    const elements: string[] = [];
    if (data.industry) elements.push(`<W2>${data.industry}</W2>`);
    if (data.marketSpecificId) elements.push(`<a3>${data.marketSpecificId}</a3>`);
    if (data.checkInDate) elements.push(`<I3>${data.checkInDate}</I3>`);
    if (data.checkOutDate) elements.push(`<I5>${data.checkOutDate}</I5>`);
    if (data.noShow !== undefined) elements.push(`<d0>${data.noShow ? '1' : '0'}</d0>`);
    if (data.dailyRate !== undefined) elements.push(`<L6>${data.dailyRate.toFixed(2)}</L6>`);
    if (data.stayDuration !== undefined) elements.push(`<r1>${data.stayDuration}</r1>`);
    if (elements.length === 0) return '';
    return `<W3>${elements.join('')}</W3>`;
  }

  private buildAccountDataMML(data: AccountData): string {
    const elements: string[] = [];
    if (data.description) elements.push(`<N5>${data.description}</N5>`);
    if (data.firstName) elements.push(`<S8>${data.firstName}</S8>`);
    if (data.lastName) elements.push(`<Y0>${data.lastName}</Y0>`);
    if (data.address) elements.push(`<B0>${data.address}</B0>`);
    if (data.address2) elements.push(`<B1>${data.address2}</B1>`);
    if (data.city) elements.push(`<I6>${data.city}</I6>`);
    if (data.postal) elements.push(`<h0>${data.postal}</h0>`);
    if (data.country) elements.push(`<K9>${data.country}</K9>`);
    if (data.region) elements.push(`<l2>${data.region}</l2>`);
    if (data.phone) elements.push(`<g0>${data.phone}</g0>`);
    if (data.cellPhone) elements.push(`<H8>${data.cellPhone}</H8>`);
    if (data.cellCarrier) elements.push(`<H7>${data.cellCarrier}</H7>`);
    if (data.email) elements.push(`<Q3>${data.email}</Q3>`);
    if (elements.length === 0) return '';
    return `<p4>${elements.join('')}</p4>`;
  }

  private wrapWithProtocol(content: string): Uint8Array {
    const STX = 0x02;
    const ETX = 0x03;

    const contentBytes = new TextEncoder().encode(content);
    const messageWithDelimiters = new Uint8Array(contentBytes.length + 2);
    messageWithDelimiters[0] = STX;
    messageWithDelimiters.set(contentBytes, 1);
    messageWithDelimiters[messageWithDelimiters.length - 1] = ETX;

    const lrc = this.calculateLRC(messageWithDelimiters.slice(1));

    const finalMessage = new Uint8Array(messageWithDelimiters.length + 1);
    finalMessage.set(messageWithDelimiters);
    finalMessage[finalMessage.length - 1] = lrc;

    return finalMessage;
  }

  private calculateLRC(data: Uint8Array): number {
    let lrc = 0;
    for (let i = 0; i < data.length; i++) {
      lrc ^= data[i];
    }
    return lrc;
  }

  private bytesToPrintable(data: Uint8Array): string {
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

  generateTransactionId(): string {
    return Date.now().toString();
  }

  validateMessage(message: Uint8Array): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (message.length < 4) {
      errors.push('Message too short');
      return { isValid: false, errors };
    }

    if (message[0] !== 0x02) errors.push('Missing STX');
    if (message[message.length - 2] !== 0x03) errors.push('Missing ETX');

    const messageWithoutLRC = message.slice(0, -1);
    const providedLRC = message[message.length - 1];
    const calculatedLRC = this.calculateLRC(messageWithoutLRC.slice(1));

    if (providedLRC !== calculatedLRC) {
      errors.push(`LRC mismatch: expected ${calculatedLRC}, got ${providedLRC}`);
    }

    console.log('✅ ============================================');
    console.log('✅ MESSAGE VALIDATION');
    console.log('✅ ============================================');
    console.log('🔍 STX:', message[0] === 0x02 ? 'OK (0x02)' : `FAIL (0x${message[0].toString(16)})`);
    console.log('🔍 ETX:', message[message.length - 2] === 0x03 ? 'OK (0x03)' : `FAIL (0x${message[message.length - 2].toString(16)})`);
    console.log('🔍 LRC:', providedLRC === calculatedLRC ? `OK (0x${providedLRC.toString(16)})` : `FAIL (expected 0x${calculatedLRC.toString(16)}, got 0x${providedLRC.toString(16)})`);
    console.log('🔍 Message Length:', message.length);
    console.log('🔍 Validation:', errors.length === 0 ? 'PASSED ✓' : `FAILED: ${errors.join(', ')}`);
    console.log('✅ ============================================');

    return { isValid: errors.length === 0, errors };
  }
}
