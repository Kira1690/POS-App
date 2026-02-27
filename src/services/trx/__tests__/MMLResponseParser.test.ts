/**
 * MMLResponseParser Unit Tests
 * Tests parsing of STX/ETX delimited MML responses from the Verifone terminal
 *
 * Real terminal responses observed during live testing (192.168.1.12:1180):
 *   Protocol BALANCE response: [STX]1772119477129|X3[ETX][LRC]
 *   Builder BALANCE response:  [STX]ID:1772119559399|X3[ETX][LRC]
 *   X3 = "Account not configured" (merchant account not set up on test terminal)
 */

import { MMLResponseParser } from '../pos/MMLResponseParser';

// Helper: build a valid STX|content|ETX+LRC test string
function buildRawResponse(content: string): string {
  const STX = '\x02';
  const ETX = '\x03';
  // Use a fake LRC byte (0x00) — parser only validates structure, not LRC
  return STX + content + ETX + '\x00';
}

describe('MMLResponseParser', () => {
  let parser: MMLResponseParser;

  beforeEach(() => {
    parser = new MMLResponseParser();
  });

  // ─── Approved SALE response ───────────────────────────────────────────────

  describe('parseResponse — approved transaction', () => {
    const approvedContent = 'TXN123|00|<D3>AUTH456</D3><A3>VISA</A3><X9>1234</X9><U8>guid-abc</U8>';
    const raw = buildRawResponse(approvedContent);

    it('sets success = true for status 00', () => {
      const result = parser.parseResponse(raw);
      expect(result.success).toBe(true);
    });

    it('extracts transaction ID', () => {
      const result = parser.parseResponse(raw);
      expect(result.transactionId).toBe('TXN123');
    });

    it('extracts status code', () => {
      const result = parser.parseResponse(raw);
      expect(result.status).toBe('00');
    });

    it('extracts approval code from D3 tag', () => {
      const result = parser.parseResponse(raw);
      expect(result.approvalCode).toBe('AUTH456');
    });

    it('extracts card brand from A3 tag', () => {
      const result = parser.parseResponse(raw);
      expect(result.accountBrand).toBe('VISA');
    });

    it('extracts last four digits from X9 tag', () => {
      const result = parser.parseResponse(raw);
      expect(result.lastFour).toBe('1234');
    });

    it('extracts GUID from U8 tag', () => {
      const result = parser.parseResponse(raw);
      expect(result.guid).toBe('guid-abc');
    });

    it('sets responseText to "Approved"', () => {
      const result = parser.parseResponse(raw);
      expect(result.responseText).toBe('Approved');
    });
  });

  // ─── Declined response ────────────────────────────────────────────────────

  describe('parseResponse — declined transaction', () => {
    it('sets success = false for status 05', () => {
      const result = parser.parseResponse(buildRawResponse('TXN456|05|'));
      expect(result.success).toBe(false);
    });

    it('sets success = false for status 51 (insufficient funds)', () => {
      const result = parser.parseResponse(buildRawResponse('TXN789|51|'));
      expect(result.success).toBe(false);
    });

    it('sets success = false for status 54 (expired card)', () => {
      const result = parser.parseResponse(buildRawResponse('TXN000|54|'));
      expect(result.success).toBe(false);
    });
  });

  // ─── Terminal error status codes (X-series) ───────────────────────────────

  describe('parseResponse — X-series error codes (real terminal responses)', () => {
    it('X3 = Account not configured (observed: live terminal at 192.168.1.12)', () => {
      // Actual response received during live testing
      const raw = buildRawResponse('ID:1772119559399|X3');
      const result = parser.parseResponse(raw);
      expect(result.status).toBe('X3');
      expect(result.success).toBe(false);
      expect(result.responseText).toBe('Account not configured');
    });

    it('X1 = Invalid message format', () => {
      const result = parser.parseResponse(buildRawResponse('T1|X1|'));
      expect(result.responseText).toBe('Invalid message format');
    });

    it('X2 = Communication error', () => {
      const result = parser.parseResponse(buildRawResponse('T1|X2|'));
      expect(result.responseText).toBe('Communication error');
    });

    it('X4 = System error', () => {
      const result = parser.parseResponse(buildRawResponse('T1|X4|'));
      expect(result.responseText).toBe('System error');
    });

    it('X5 = Invalid amount', () => {
      const result = parser.parseResponse(buildRawResponse('T1|X5|'));
      expect(result.responseText).toBe('Invalid amount');
    });

    it('X8 = Transaction timeout', () => {
      const result = parser.parseResponse(buildRawResponse('T1|X8|'));
      expect(result.responseText).toBe('Transaction timeout');
    });

    it('unknown X-status returns "Transaction declined"', () => {
      const result = parser.parseResponse(buildRawResponse('T1|X99|'));
      expect(result.responseText).toBe('Transaction declined');
    });

    it('unknown non-X status returns "Unknown status"', () => {
      const result = parser.parseResponse(buildRawResponse('T1|ZZ|'));
      expect(result.responseText).toBe('Unknown status');
    });
  });

  // ─── Invalid / malformed responses ───────────────────────────────────────

  describe('parseResponse — invalid input', () => {
    it('returns error response for missing STX', () => {
      const result = parser.parseResponse('TXN|00|\x03\x00');
      expect(result.success).toBe(false);
      expect(result.transactionId).toBe('UNKNOWN');
    });

    it('returns error response for empty string', () => {
      const result = parser.parseResponse('');
      expect(result.success).toBe(false);
    });

    it('returns error response for response too short (<4 chars)', () => {
      const result = parser.parseResponse('\x02\x03');
      expect(result.success).toBe(false);
    });

    it('includes rawResponse in all results', () => {
      const raw = buildRawResponse('T1|00|');
      const result = parser.parseResponse(raw);
      expect(result.rawResponse).toBe(raw);
    });
  });

  // ─── parseSaleResponse ────────────────────────────────────────────────────

  describe('parseSaleResponse', () => {
    it('returns same result as parseResponse for approved', () => {
      const raw = buildRawResponse('T1|00|<D3>APPR77</D3><A3>MASTERCARD</A3>');
      const fromParse = parser.parseResponse(raw);
      const fromSale = parser.parseSaleResponse(raw);
      expect(fromSale.success).toBe(fromParse.success);
      expect(fromSale.approvalCode).toBe(fromParse.approvalCode);
      expect(fromSale.accountBrand).toBe(fromParse.accountBrand);
    });
  });

  // ─── parseBalanceResponse ─────────────────────────────────────────────────

  describe('parseBalanceResponse', () => {
    it('returns same result as parseResponse', () => {
      const raw = buildRawResponse('T1|00|<AvailableBalance>500.00</AvailableBalance>');
      const result = parser.parseBalanceResponse(raw);
      expect(result.success).toBe(true);
      expect(result.availableBalance).toBe('500.00');
    });
  });

  // ─── EMV tag extraction ───────────────────────────────────────────────────

  describe('EMV tag extraction', () => {
    it('extracts multiple BL EMV tags', () => {
      const raw = buildRawResponse('T1|00|<BL>9F10|01020304</BL><BL>9F26|ABCDEF01</BL>');
      const result = parser.parseResponse(raw);
      expect(result.emvTags).toBeDefined();
      expect(result.emvTags?.['9F10']).toBe('01020304');
      expect(result.emvTags?.['9F26']).toBe('ABCDEF01');
    });

    it('returns undefined emvTags when no BL tags present', () => {
      const raw = buildRawResponse('T1|00|<D3>AUTH</D3>');
      const result = parser.parseResponse(raw);
      expect(result.emvTags).toBeUndefined();
    });
  });
});
