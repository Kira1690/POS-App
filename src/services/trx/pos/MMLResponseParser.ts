import { LoggerFactory } from '../logging/LoggingService';

export interface ParsedResponse {
  transactionId: string;
  status: string;
  responseText: string;
  success: boolean;

  // Reference data
  guid?: string;
  tranDate?: string;
  tranTime?: string;
  purchaseId?: string;
  accountBrand?: string;
  lastFour?: string;

  // Result data
  approvalCode?: string;
  avsResult?: string;
  availableBalance?: string;

  // Batch data
  totalCount?: string;
  totalAmount?: string;
  averageTicket?: string;
  netAmount?: string;
  debitCount?: string;
  debitAmount?: string;
  creditCount?: string;
  creditAmount?: string;

  // EMV data
  emvTags?: Record<string, string>;

  // Raw response for debugging
  rawResponse: string;
}

export class MMLResponseParser {
  private logger = LoggerFactory.createLogger('MMLResponseParser');

  parseResponse(rawResponse: string): ParsedResponse {
    this.logger.debug('Parsing MML response', 'parseResponse', {
      responseLength: rawResponse.length,
      rawResponse: this.sanitizeForLogging(rawResponse)
    });

    try {
      const validation = this.validateResponseFormat(rawResponse);
      if (!validation.isValid) {
        this.logger.warn('Invalid response format', 'parseResponse', { errors: validation.errors });
        return this.createErrorResponse(rawResponse, 'Invalid response format');
      }

      const { transactionId, status, mmlData } = this.extractMainComponents(rawResponse);
      const mmlFields = this.parseMMLData(mmlData);

      const result: ParsedResponse = {
        transactionId,
        status,
        responseText: this.getResponseText(status, mmlFields),
        success: status === '00',
        rawResponse,
        ...mmlFields
      };

      this.logger.info('MML response parsed successfully', 'parseResponse', {
        transactionId: result.transactionId,
        status: result.status,
        success: result.success,
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to parse MML response', error instanceof Error ? error : new Error(String(error)), 'parseResponse');
      return this.createErrorResponse(rawResponse, 'Parse error');
    }
  }

  private validateResponseFormat(response: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (response.length < 4) { errors.push('Response too short'); return { isValid: false, errors }; }
    if (response.charCodeAt(0) !== 0x02) errors.push('Missing STX');
    if (response.charCodeAt(response.length - 2) !== 0x03) errors.push('Missing ETX');
    const content = response.slice(1, -2);
    const parts = content.split('|');
    if (parts.length < 2) errors.push('Invalid message structure - missing required delimiters');
    return { isValid: errors.length === 0, errors };
  }

  private extractMainComponents(response: string): { transactionId: string; status: string; mmlData: string } {
    const content = response.slice(1, -2);
    const parts = content.split('|');
    return {
      transactionId: parts[0] || '',
      status: parts[1] || '',
      mmlData: parts.slice(2).join('|')
    };
  }

  private parseMMLData(mmlData: string): Partial<ParsedResponse> {
    const fields: Partial<ParsedResponse> = {};
    if (!mmlData) return fields;

    fields.guid = this.extractMMLTag(mmlData, 'U8');
    fields.tranDate = this.extractMMLTag(mmlData, 'w7');
    fields.tranTime = this.extractMMLTag(mmlData, 'x1');
    fields.purchaseId = this.extractMMLTag(mmlData, 'j3');
    fields.accountBrand = this.extractMMLTag(mmlData, 'A3');
    fields.lastFour = this.extractMMLTag(mmlData, 'X9');
    fields.approvalCode = this.extractMMLTag(mmlData, 'D3');
    fields.avsResult = this.extractMMLTag(mmlData, 'E4');
    fields.availableBalance = this.extractMMLTag(mmlData, 'AvailableBalance');
    fields.totalCount = this.extractMMLTag(mmlData, 'BD');
    fields.totalAmount = this.extractMMLTag(mmlData, 'BE');
    fields.emvTags = this.extractEMVTags(mmlData);

    Object.keys(fields).forEach(key => {
      if (fields[key as keyof ParsedResponse] === undefined) {
        delete fields[key as keyof ParsedResponse];
      }
    });

    return fields;
  }

  private extractMMLTag(mmlData: string, tagName: string): string | undefined {
    const regex = new RegExp(`<${tagName}>([^<]*)<\/${tagName}>`, 'i');
    const match = mmlData.match(regex);
    return match ? match[1] : undefined;
  }

  private extractEMVTags(mmlData: string): Record<string, string> | undefined {
    const emvTags: Record<string, string> = {};
    const blRegex = /<BL>([^<]*)<\/BL>/gi;
    let match;
    while ((match = blRegex.exec(mmlData)) !== null) {
      const tagValue = match[1];
      const [tag, value] = tagValue.split('|');
      if (tag && value) emvTags[tag] = value;
    }
    return Object.keys(emvTags).length > 0 ? emvTags : undefined;
  }

  private getResponseText(status: string, mmlFields: Partial<ParsedResponse>): string {
    const explicitText = mmlFields.rawResponse ? this.extractMMLTag(mmlFields.rawResponse, 'm6') : undefined;
    if (explicitText) return explicitText;

    switch (status) {
      case '00': return 'Approved';
      case 'X1': return 'Invalid message format';
      case 'X2': return 'Communication error';
      case 'X3': return 'Account not configured';
      case 'X4': return 'System error';
      case 'X5': return 'Invalid amount';
      case 'X6': return 'Card declined';
      case 'X7': return 'Invalid card';
      case 'X8': return 'Transaction timeout';
      case 'X9': return 'Network error';
      default: return status.startsWith('X') ? 'Transaction declined' : 'Unknown status';
    }
  }

  private createErrorResponse(rawResponse: string, errorMessage: string): ParsedResponse {
    return { transactionId: 'UNKNOWN', status: 'X1', responseText: errorMessage, success: false, rawResponse };
  }

  private sanitizeForLogging(response: string): string {
    if (response.length > 20) return `${response.substring(0, 10)}...${response.substring(response.length - 10)}`;
    return response;
  }

  parseBalanceResponse(rawResponse: string): ParsedResponse {
    return this.parseResponse(rawResponse);
  }

  parseBatchResponse(rawResponse: string): ParsedResponse {
    return this.parseResponse(rawResponse);
  }

  parseSaleResponse(rawResponse: string): ParsedResponse {
    const response = this.parseResponse(rawResponse);
    if (response.success && !response.approvalCode) {
      this.logger.warn('Sale response missing approval code', 'parseSaleResponse');
    }
    return response;
  }
}
