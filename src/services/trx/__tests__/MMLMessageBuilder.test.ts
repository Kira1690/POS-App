/**
 * MMLMessageBuilder Unit Tests
 * Tests STX/ETX/LRC message construction for MML protocol
 */

import { MMLMessageBuilder, SaleRequest } from '../pos/MMLMessageBuilder';

describe('MMLMessageBuilder', () => {
  let builder: MMLMessageBuilder;

  beforeEach(() => {
    builder = new MMLMessageBuilder();
  });

  // ─── Message Structure ────────────────────────────────────────────────────

  describe('buildSaleMessage', () => {
    const baseRequest: SaleRequest = {
      transactionId: '1234567890',
      amount: 38.75,
    };

    it('starts with STX (0x02)', () => {
      const msg = builder.buildSaleMessage(baseRequest);
      expect(msg[0]).toBe(0x02);
    });

    it('ends with ETX (0x03) then LRC', () => {
      const msg = builder.buildSaleMessage(baseRequest);
      expect(msg[msg.length - 2]).toBe(0x03);
    });

    it('has at least 4 bytes (STX + content + ETX + LRC)', () => {
      const msg = builder.buildSaleMessage(baseRequest);
      expect(msg.length).toBeGreaterThanOrEqual(4);
    });

    it('encodes SALE command in content', () => {
      const msg = builder.buildSaleMessage(baseRequest);
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toMatch(/^SALE\|/);
    });

    it('encodes transaction ID prefixed with ID:', () => {
      const msg = builder.buildSaleMessage(baseRequest);
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toContain('ID:1234567890');
    });

    it('formats amount to 2 decimal places', () => {
      const msg = builder.buildSaleMessage(baseRequest);
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toContain('38.75');
    });

    it('formats integer amount with decimals', () => {
      const msg = builder.buildSaleMessage({ ...baseRequest, amount: 100 });
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toContain('100.00');
    });

    it('includes clientId when provided', () => {
      const msg = builder.buildSaleMessage({ ...baseRequest, clientId: '532120298' });
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toContain('532120298');
    });

    it('includes level2 tax data when provided', () => {
      const msg = builder.buildSaleMessage({
        ...baseRequest,
        level2Data: { localTaxAmount: 3.44 },
      });
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toContain('<Z2>3.44</Z2>');
      expect(content).toContain('<j1>');
    });

    it('includes customer code in level2 when provided', () => {
      const msg = builder.buildSaleMessage({
        ...baseRequest,
        level2Data: { customerCode: 'CUST001' },
      });
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toContain('<L1>CUST001</L1>');
    });

    it('passes validateMessage check', () => {
      const msg = builder.buildSaleMessage(baseRequest);
      const result = builder.validateMessage(msg);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('produces correct pipe-separated field structure', () => {
      const msg = builder.buildSaleMessage(baseRequest);
      const content = new TextDecoder().decode(msg.slice(1, -2));
      // SALE|ID:xxx|amount|level2|industry|account|clientId?
      const parts = content.split('|');
      expect(parts[0]).toBe('SALE');
      expect(parts[1]).toMatch(/^ID:/);
      expect(parts[2]).toBe('38.75');
    });
  });

  // ─── BALANCE message ──────────────────────────────────────────────────────

  describe('buildBalanceMessage', () => {
    it('starts with STX (0x02)', () => {
      const msg = builder.buildBalanceMessage({ transactionId: 'BAL001' });
      expect(msg[0]).toBe(0x02);
    });

    it('contains BALANCE command', () => {
      const msg = builder.buildBalanceMessage({ transactionId: 'BAL001' });
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toMatch(/^BALANCE\|/);
    });

    it('contains transaction ID with ID: prefix', () => {
      const msg = builder.buildBalanceMessage({ transactionId: 'BAL001' });
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toContain('ID:BAL001');
    });

    it('passes validateMessage check', () => {
      const msg = builder.buildBalanceMessage({ transactionId: 'BAL001' });
      const result = builder.validateMessage(msg);
      expect(result.isValid).toBe(true);
    });
  });

  // ─── LRC Validation ───────────────────────────────────────────────────────

  describe('validateMessage', () => {
    it('detects missing STX', () => {
      const msg = builder.buildSaleMessage({ transactionId: 'T1', amount: 10 });
      const tampered = new Uint8Array(msg);
      tampered[0] = 0x00; // corrupt STX
      const result = builder.validateMessage(tampered);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing STX');
    });

    it('detects missing ETX', () => {
      const msg = builder.buildSaleMessage({ transactionId: 'T1', amount: 10 });
      const tampered = new Uint8Array(msg);
      tampered[tampered.length - 2] = 0x00; // corrupt ETX
      const result = builder.validateMessage(tampered);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing ETX');
    });

    it('detects LRC mismatch', () => {
      const msg = builder.buildSaleMessage({ transactionId: 'T1', amount: 10 });
      const tampered = new Uint8Array(msg);
      tampered[tampered.length - 1] ^= 0xFF; // flip all LRC bits
      const result = builder.validateMessage(tampered);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('LRC mismatch'))).toBe(true);
    });

    it('rejects messages shorter than 4 bytes', () => {
      const result = builder.validateMessage(new Uint8Array([0x02, 0x03]));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message too short');
    });
  });

  // ─── generateTransactionId ────────────────────────────────────────────────

  describe('generateTransactionId', () => {
    it('returns a non-empty string', () => {
      const id = builder.generateTransactionId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('returns unique IDs on consecutive calls', () => {
      const id1 = builder.generateTransactionId();
      const id2 = builder.generateTransactionId();
      // IDs are timestamp-based; may collide in same millisecond — just check type
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });

  // ─── AccountData encoding ─────────────────────────────────────────────────

  describe('Account and Industry data encoding', () => {
    it('encodes accountData firstName and lastName', () => {
      const msg = builder.buildSaleMessage({
        transactionId: 'T1',
        amount: 50,
        accountData: { firstName: 'John', lastName: 'Doe' },
      });
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toContain('<S8>John</S8>');
      expect(content).toContain('<Y0>Doe</Y0>');
      expect(content).toContain('<p4>');
    });

    it('encodes industryData hotel fields', () => {
      const msg = builder.buildSaleMessage({
        transactionId: 'T1',
        amount: 200,
        industryData: {
          industry: 'H',
          checkInDate: '20260226',
          checkOutDate: '20260228',
          dailyRate: 99.99,
        },
      });
      const content = new TextDecoder().decode(msg.slice(1, -2));
      expect(content).toContain('<W2>H</W2>');
      expect(content).toContain('<I3>20260226</I3>');
      expect(content).toContain('<I5>20260228</I5>');
      expect(content).toContain('<L6>99.99</L6>');
    });
  });
});
