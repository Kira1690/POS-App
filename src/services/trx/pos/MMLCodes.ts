export const MMLCodes = {
  // Transaction Reference
  U8: 'Guid',
  w7: 'TransactionDate',
  x1: 'TransactionTime',
  j3: 'PurchaseId',
  A3: 'CardType',
  f9: 'LastFourDigits',

  // Transaction Result
  m5: 'ResponseCode',
  m6: 'ResponseText',
  A1: 'ApprovalCode',
  D3: 'ApprovalCodeAlt',
  C8: 'Amount',

  // Level II Data
  Z2: 'TaxAmount',
  L1: 'PONumber',
  Z4: 'CustomerCode',

  // Level III Data
  m2: 'FreightAmount',
  m3: 'DutyAmount',
  s4: 'DestinationZip',
  s5: 'ShipFromZip',

  // Line Item Data
  k1: 'ItemDescription',
  k2: 'Quantity',
  k3: 'UnitCost',
  k4: 'UnitOfMeasure',
  k5: 'CommodityCode',
  k6: 'DiscountAmount',
  k7: 'TaxAmount',

  // EBT Specific
  AvailableBalance: 'AvailableBalance',

  // Additional Fields
  a9: 'TerminalId',
  b1: 'MerchantId',
  C4: 'TransactionType',
  C5: 'EntryMode',
  g1: 'CVVResult',
  g2: 'AVSResult',

  // Container Elements
  m4: 'Response',
  k9: 'Reference',
  m7: 'Result',
  j1: 'LevelIIData',
  j2: 'LevelIIIData',
};

export const ResponseCodes: Record<string, string> = {
  '00': 'Approved',
  '01': 'Refer to card issuer',
  '02': 'Refer to card issuer, special condition',
  '03': 'Invalid merchant',
  '04': 'Pick-up card',
  '05': 'Do not honor',
  '06': 'Error',
  '07': 'Pick-up card, special condition',
  '08': 'Honor with identification',
  '09': 'Request in progress',
  '10': 'Approved, partial',
  '11': 'Approved, VIP',
  '12': 'Invalid transaction',
  '13': 'Invalid amount',
  '14': 'Invalid card number',
  '15': 'No such issuer',
  '19': 'Re-enter transaction',
  '21': 'No action taken',
  '51': 'Insufficient funds',
  '54': 'Expired card',
  '55': 'Incorrect PIN',
  '57': 'Transaction not permitted to cardholder',
  '62': 'Restricted card',
  '91': 'Issuer or switch inoperative',
  '96': 'System malfunction',
};
