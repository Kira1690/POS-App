# Payment Tests

## Screens Covered
- `PaymentScreen` — payment method selection, amount, confirmation
- `BillingScreen` — itemised bill, discounts, tips
- `ReceiptScreen` — post-payment receipt view
- `PaymentStorageService` — SQLite persistence for transactions
- `PaymentContext` — payment state and method management

## Payment Flow
```
Order status = "served"
  → PaymentScreen
  → Method selected (cash/card/split)
  → Amount confirmed
  → Transaction saved to SQLite
  → Order status = "paid"
  → Receipt shown
```
> Payment button ONLY available when order status = "served".
> Payment cannot be undone once confirmed.

---

## Unit Tests (Jest)

### PaymentStorageService
| Test | Description | Status |
|------|-------------|--------|
| `saveTransaction()` inserts row into transactions table | Mock DB, check INSERT | pending |
| `getTransactionById()` returns transaction record | SELECT | pending |
| `getTransactionsByOrder()` returns all transactions for orderId | Multiple payments | pending |
| `getTransactionsByDateRange()` filters by start/end date | Date range query | pending |
| `getTotalRevenue()` sums all paid amounts | 5 transactions | pending |
| `getTodayRevenue()` sums only today's transactions | Mock Date | pending |
| `getTransactionsByMethod()` filters by cash/card/split | pending |
| `refundTransaction()` marks transaction as refunded | Status update check | pending |

### Payment calculations
| Test | Description | Status |
|------|-------------|--------|
| Cash change = amountTendered - totalDue | $50 tendered, $38.75 due → $11.25 change | pending |
| Cash change = 0 when amountTendered = totalDue | Exact amount | pending |
| amountTendered must be ≥ totalDue (cash) | $30 tendered, $38.75 due → error | pending |
| Split payment — remaining balance after partial payment | $50 total, $20 paid → $30 remaining | pending |
| Tip percentage calculations | 10%, 15%, 18%, 20% of subtotal | pending |
| Custom tip amount respected | Enter $5.00 custom tip | pending |
| Discount applied before tip calculation | 10% off $100, 15% tip on $90 | pending |
| Tax included in total (not added separately at payment) | Verify no double-tax | pending |
| Receipt total matches order total | Cross-check order.totalAmount | pending |

### PaymentContext
| Test | Description | Status |
|------|-------------|--------|
| `setPaymentMethod` updates selected method | cash, card, split | pending |
| `setAmountTendered` updates tender amount | pending |
| `processPayment` validates order status = "served" | Reject if status ≠ served | pending |
| `processPayment` saves transaction and updates order | Mock storage | pending |
| `resetPayment` clears all payment state | After payment or cancel | pending |

---

## Integration Tests (Jest)

| Test | Description | Status |
|------|-------------|--------|
| PaymentScreen blocked for non-served orders | status="preparing" → button disabled/hidden | pending |
| PaymentScreen enabled for served order | status="served" → button active | pending |
| Payment method "Cash" shows amount tendered input | Tap Cash, input appears | pending |
| Payment method "Card" shows card confirmation UI | Tap Card | pending |
| Payment method "Split" shows split bill UI | Tap Split | pending |
| Tip selector shows preset percentages + custom | 10%, 15%, 18%, 20%, Custom | pending |
| Selecting tip updates total displayed | 15% on $100 → $115 shown | pending |
| Custom tip input updates total | Enter 7.50, total updates | pending |
| "Confirm Payment" calls processPayment() | fireEvent.press | pending |
| After payment, order status = "paid" | Check context | pending |
| After payment, receipt screen shown | Navigation check | pending |
| ReceiptScreen shows itemised bill | All order items listed | pending |
| ReceiptScreen shows subtotal, tax, tip, total | All financial fields | pending |
| "Print Receipt" button calls print service | Mock print service | pending |
| "New Order" button navigates to table selection | fireEvent.press | pending |

---

## E2E Tests — Offline (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Payment button not visible for draft order | assert button absent | pending |
| Payment button visible after order served | Full flow: create → serve → payment | pending |
| Complete cash payment flow | `pending/cash_payment_offline.yaml` | pending |
| Change calculation shown for cash payment | Enter $50 for $38.75 order | pending |
| Card payment confirmation flow | `pending/card_payment_offline.yaml` | pending |
| Split payment between 2 methods | `pending/split_payment_offline.yaml` | pending |
| Receipt screen appears after payment | assert receipt visible | pending |
| Order moves to "paid" status after payment | Check order list | pending |
| Transaction persists in SQLite after payment | Restart app, check history | pending |

---

## E2E Tests — Online (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Card payment processed via payment gateway | `online/card_payment_online.yaml` | pending |
| Receipt returned from backend after payment | pending |
| Refund processed and reflected in order | pending |
| Payment synced to backend when connectivity restored | pending |

---

## Acceptance Criteria

- [ ] Payment button only appears when order status = "served"
- [ ] Cash change calculated correctly
- [ ] Tip calculation works for all preset and custom amounts
- [ ] Transaction saved to SQLite immediately
- [ ] Order status updated to "paid" after successful payment
- [ ] Receipt screen shows accurate itemised bill
- [ ] Split payment correctly tracks partial payments
- [ ] Payment history accessible from order details
