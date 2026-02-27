# MML Protocol Reference

## Overview
MML (Merchant Mobile Link) is a TCP/IP protocol used to communicate with Verifone POS terminals (VP3350, etc.).

## Message Format
```
<STX> FIELD1 | FIELD2 | FIELD3 | ... <ETX> <LRC>
```
- **STX**: 0x02 (Start of Text)
- **ETX**: 0x03 (End of Text)
- **LRC**: XOR of all bytes from STX to ETX (inclusive) → last byte

## SALE Message Fields
```
SALE|{TranId}|{Amount}|{Level2Data}|{IndustryData}|{AccountData}|{ClientId}
```
- **TranId**: Unique transaction ID (timestamp-based)
- **Amount**: Total amount in cents (no decimal)
- **Level2Data**: Optional tax/tip data in XML
- **IndustryData**: Optional industry-specific data
- **AccountData**: Optional account data
- **ClientId**: `532120298` (static download key)

## BALANCE Message Fields
```
BALANCE|{TranId}||||||{ClientId}
```

## Response Format
XML-structured response:
```xml
<Response>
  <Status>00</Status>
  <ResponseText>APPROVED</ResponseText>
  <ApprovalCode>123456</ApprovalCode>
  <AccountBrand>VISA</AccountBrand>
  <LastFour>1234</LastFour>
  <GUID>uuid</GUID>
  <PurchaseID>pid</PurchaseID>
</Response>
```

## Status Codes
- `00`: Approved
- `05`: Declined
- `12`: Invalid transaction
- `51`: Insufficient funds
- `54`: Expired card
- `65`: Exceeds withdrawal limit

## Level2Data XML (Tax + Tip)
```xml
<Level2Data>
  <LocalTaxAmount>{taxCents}</LocalTaxAmount>
  <TipAmount>{tipCents}</TipAmount>
</Level2Data>
```

## Network
- Default port: **1180**
- Timeout: 360 seconds (6 minutes — terminal waits for card tap)
- Connection: New TCP connection per transaction (connect-and-send pattern)
