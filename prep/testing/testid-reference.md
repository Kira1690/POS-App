# testID Reference Sheet

> Convention: `btn-*` = button, `input-*` = text input, `switch-*` = toggle, `tab-*` = tab chip
> Last updated: 2026-03-02
>
> ⚠️ **QA 19 (split card+cash)** requires `com.ajinkya123.POSReactNativeApp` dev build — TCP sockets unavailable in Expo Go.

---

## Bottom Tab Navigation

| testID | Element |
|--------|---------|
| `tab-nav-dashboard` | Dashboard tab |
| `tab-nav-orders` | Order Management tab |
| `tab-nav-kitchen` | Kitchen Operations tab |
| `tab-nav-settings` | Settings tab |

---

## Settings Sidebar (AppleSidebarCollapsible)

| testID | Element |
|--------|---------|
| `settings-nav-restaurant_profile` | Restaurant Profile |
| `settings-nav-user_management` | User Management |
| `settings-nav-device_hardware` | Device & Hardware |
| `settings-nav-payment_config` | Payment Configuration |
| `settings-nav-trx_payment` | TRX Terminal |
| `settings-nav-table_management` | Table Management |
| `settings-nav-menu_management` | Menu Management |
| `settings-nav-kitchen_management` | Kitchen Management |
| `settings-nav-integrations` | Integrations |
| `settings-nav-security_backup` | Security & Backup |
| `settings-nav-system_logs` | System Logs |
| `settings-nav-help_support` | Help & Support |

---

## Menu Management Tabs

| testID | Element |
|--------|---------|
| `tab-menu-items` | Items tab |
| `tab-menu-modifiers` | Modifiers tab |
| `tab-menu-combos` | Combos tab |

---

## Authentication Screens

| testID | Element | Screen |
|--------|---------|--------|
| `btn-welcome-manager-login` | Manager Login button | WelcomeScreen |
| `btn-welcome-staff-login` | Staff Login button | WelcomeScreen |
| `email-input` | Email field | ManagerLoginScreen |
| `password-input` | Password field | ManagerLoginScreen |
| `btn-manager-sign-in` | Sign In button | ManagerLoginScreen |
| `input-employee-id` | Employee ID field | StaffLoginScreen |
| `input-staff-password` | Password field | StaffLoginScreen |
| `btn-staff-login` | Login button | StaffLoginScreen |
| `btn-logout` | Logout button | Settings / Profile |

---

## Order Management Screen

| testID | Element | Screen/Component |
|--------|---------|-----------------|
| `input-order-search` | Search orders text field | OrderManagementScreen |
| `btn-clear-search` | Clear search (X) button | OrderManagementScreen |
| `tab-status-all` | All status filter chip | OrderManagementScreen |
| `tab-status-active` | Active filter chip | OrderManagementScreen |
| `tab-status-draft` | Draft filter chip | OrderManagementScreen |
| `tab-status-confirmed` | Confirmed filter chip | OrderManagementScreen |
| `tab-status-preparing` | Preparing filter chip | OrderManagementScreen |
| `tab-status-ready` | Ready filter chip | OrderManagementScreen |
| `tab-status-served` | Served filter chip | OrderManagementScreen |
| `tab-status-paid` | Paid filter chip | OrderManagementScreen |
| `tab-status-cancelled` | Cancelled filter chip | OrderManagementScreen |
| `tab-payment-all` | All payment filter chip | OrderManagementScreen |
| `tab-payment-paid` | Paid payment filter chip | OrderManagementScreen |
| `tab-payment-pending` | Pending/unpaid filter chip | OrderManagementScreen |
| `btn-new-order` | New Order action button | OrderManagementScreen |
| `btn-refresh-orders` | Refresh list button | OrderManagementScreen |

---

## Order Card (OrderListItem)

| testID | Element | Notes |
|--------|---------|-------|
| `btn-order-pay` | Pay button on order card | Only visible for unpaid SERVED/READY orders |
| `btn-order-view` | View / Details button on order card | Always visible |

---

## POS Order Screen

| testID | Element | Notes |
|--------|---------|-------|
| `btn-table-select-{tableNumber}` | Table picker chip | e.g. `btn-table-select-T1`, `btn-table-select-B1` |
| `tab-category-chip-all` | "All Items" category chip | Portrait mode sidebar |
| `tab-category-chip-{categoryId}` | Category filter chip | Portrait mode sidebar |
| `input-menu-search-portrait` | Search menu items field | Portrait mode |
| `btn-modifier-confirm` | Confirm modifier selection button | ModifierSelectionModal |

---

## Payment Method Selector (PaymentProcessingScreen)

| testID | Element | Notes |
|--------|---------|-------|
| `btn-pay-method-cash` | Cash Payment button | PaymentMethodSelector |
| `btn-pay-method-card` | Card Payment button | PaymentMethodSelector |
| `btn-pay-method-split` | Split Payment button | PaymentMethodSelector |
| `btn-pay-method-trx` | TRX Terminal button | PaymentMethodSelector |

---

## Cash Payment Modal

| testID | Element | Notes |
|--------|---------|-------|
| `btn-cash-quick-{amount}` | Quick cash amount button | `amount` = integer dollars, e.g. `btn-cash-quick-10`, `btn-cash-quick-15`, `btn-cash-quick-20`, `btn-cash-quick-25`, `btn-cash-quick-30` |
| `btn-cash-cancel` | Cancel button | CashPaymentModal |
| `btn-cash-confirm` | Confirm payment button | CashPaymentModal |

---

## Menu Management Settings (Settings screen)

| testID | Element | Screen/Component |
|--------|---------|-----------------|
| `btn-add-category` | Add Category button | CategorySidebar |
| `input-category-name` | Category name input | AddCategoryModal |
| `btn-save-category` | Save button | AddCategoryModal |
| `input-modifier-group-name` | Group name input | AddModifierGroupModal |
| `btn-create-modifier-group` | Create button | AddModifierGroupModal |
| `input-modifier-option-name` | Option name input | AddModifierOptionModal |
| `input-modifier-option-price` | Option price input | AddModifierOptionModal |
| `btn-save-modifier-option` | Save button | AddModifierOptionModal |
| `btn-add-option` | Add Option button | ModifierGroupCard |
| `btn-delete-modifier-group` | Delete group button | ModifierGroupCard |
| `btn-confirm-delete` | Confirm delete button | DeleteConfirmDialog |

---

## Discount Modal

| testID | Element |
|--------|---------|
| `btn-discount-modal-close` | Close (X) button |
| `btn-discount-type-percentage` | Percentage type toggle |
| `btn-discount-type-fixed` | Fixed amount type toggle |
| `btn-preset-5` … `btn-preset-50` | Preset % buttons (5, 10, 15, 20, 25, 50) |
| `input-discount-percentage` | Custom % text input |
| `input-discount-fixed` | Fixed amount text input |
| `btn-reason-manager-comp` | Reason chip: Manager comp |
| `btn-reason-customer-complaint` | Reason chip: Customer complaint |
| `btn-reason-birthday-special` | Reason chip: Birthday special |
| `btn-reason-loyalty-reward` | Reason chip: Loyalty reward |
| `btn-reason-error-correction` | Reason chip: Error correction |
| `btn-reason-promotion` | Reason chip: Promotion |
| `btn-reason-employee-discount` | Reason chip: Employee discount |
| `btn-reason-other` | Reason chip: Other |
| `input-custom-reason` | Free-text reason field |
| `btn-remove-discount` | Remove existing discount |
| `btn-cancel-discount` | Cancel without applying |
| `btn-apply-discount` | Apply the discount |

---

## Dashboard (ManagerDashboard)

| testID | Element |
|--------|---------|
| `btn-dashboard-view-all` | "View All" link in Recent Orders section |
| `btn-recent-order-{id}` | Tappable recent order card (dynamic ID) |

### OrderSummarySheet (bottom-sheet modal)

| testID | Element |
|--------|---------|
| `btn-order-summary-close` | Close (X) button on sheet |
| `btn-order-summary-view-full` | "View Full Details" button |

---

## Table Selection Modal

| testID | Element |
|--------|---------|
| `btn-table-modal-close` | Close (X) button |
| `btn-area-tab-all` | "All" area filter tab |
| `btn-area-tab-{area.id}` | Area-specific tab (dynamic area ID) |
| `btn-table-select-{tableNumber}` | Table card (e.g. `btn-table-select-B-1`) |

---

## Bill Screen

| testID | Element |
|--------|---------|
| `btn-bill-back` | Back button |
| `btn-tip-0` | No Tip button |
| `btn-tip-15` | 15% tip |
| `btn-tip-18` | 18% tip |
| `btn-tip-20` | 20% tip |
| `btn-tip-25` | 25% tip |
| `btn-split-equally` | Split Equally option |
| `btn-split-by-items` | Split by Items option |
| `btn-split-by-payment` | Multiple Payments option |
| `btn-combine-bills` | Combine Bills option (4th option) |
| `btn-pay-full` | Pay full amount button |

### CombineBillsModal

| testID | Element |
|--------|---------|
| `btn-combine-close` | Close (X) button |

---

## Bill Split Screen

| testID | Element |
|--------|---------|
| `tab-split-equal` | Equal split tab |
| `tab-split-by_items` | By Items tab |
| `tab-split-by_payment_method` | Payment Methods tab |
| `btn-pay-all` | Pay All / Process button |
| `btn-guest-count-increase` | + (add guest) button |
| `btn-guest-count-decrease` | − (remove guest) button |

---

## Payment Processing Screen

| testID | Element |
|--------|---------|
| `btn-payment-back` | Back arrow in header |
| `btn-cancel-payment` | Cancel button |
| `btn-print-receipt-payment` | Print Receipt button |

---

## Payment Confirmation Screen

| testID | Element |
|--------|---------|
| `btn-print-receipt` | Print Receipt button |
| `btn-email-receipt` | Email Receipt button |
| `btn-sms-receipt` | SMS Receipt button |
| `btn-new-order` | New Order button |
| `btn-continue` | Continue / Back to Bill Split button |

---

## Kitchen Dashboard

| testID | Element |
|--------|---------|
| `btn-kitchen-refresh` | Refresh button |
| `tab-kitchen-filter-all` | All filter chip |
| `tab-kitchen-filter-pending` | Confirmed filter chip |
| `tab-kitchen-filter-preparing` | Preparing filter chip |
| `tab-kitchen-filter-ready` | Ready filter chip |
| `btn-kitchen-action-{orderId}` | Start/Ready/Served action button on each card |

---

## Menu Management Settings

### MenuEditorToolbar

| testID | Element |
|--------|---------|
| `input-search-items` | Search text field |
| `btn-clear-search` | Clear search (X) |
| `btn-filter-items` | Filter button |
| `btn-sort-toggle` | Sort order toggle |
| `btn-view-grid` | Grid view toggle |
| `btn-view-list` | List view toggle |
| `btn-undo` | Undo button |
| `btn-redo` | Redo button |
| `btn-add-item` | Add Item button |
| `btn-import-items` | Import button |
| `btn-export-items` | Export button |

### AddMenuItemModal

| testID | Element |
|--------|---------|
| `input-item-name` | Item name field (Basic step) |
| `input-selling-price` | Selling price field (Pricing step) |
| `modal-next-btn` | Next / Create Item button |

### MenuItemCard (Items grid)

| testID | Element | Notes |
|--------|---------|-------|
| `btn-edit-item-{slug}` | Edit (pencil) button | slug = `name.toLowerCase().replace(/\s+/g, '-')` |
| `btn-assign-modifiers-{slug}` | Assign Modifiers button | same slug formula |

**Examples:**
- `btn-edit-item-garlic-bread` — Edit "Garlic Bread"
- `btn-edit-item-latte` — Edit "Latte"
- `btn-edit-item-beef-burger` — Edit "Beef Burger"

### EditMenuItemModal

| testID | Element |
|--------|---------|
| `tab-edit-item-basic` | Basic Info tab |
| `tab-edit-item-pricing` | Pricing tab |
| `tab-edit-item-modifiers` | Modifiers tab |
| `tab-edit-item-nutritional` | Nutrition tab |
| `input-edit-item-name` | Item name field |
| `btn-cancel-edit-item` | Cancel button |
| `btn-save-item-changes` | Save Changes button |

#### Kitchen Station Picker (Basic tab)

| testID | Element | Notes |
|--------|---------|-------|
| `btn-station-auto` | "Auto" chip | Clears override; subtitle shows auto-derived station name |
| `btn-station-hot_kitchen` | Hot Kitchen chip | Explicit override |
| `btn-station-cold_kitchen` | Cold Kitchen chip | Explicit override |
| `btn-station-grill` | Grill Station chip | Explicit override |
| `btn-station-desserts` | Desserts chip | Explicit override |
| `btn-station-beverages` | Beverages chip | Explicit override |
| `btn-station-bar` | Bar chip | Explicit override |

> Only **active** stations are rendered as chips. If a station is toggled off in Kitchen Management,
> its chip will not appear. The station IDs match the `KitchenStation` union type.

### EditCategoryModal

| testID | Element |
|--------|---------|
| `input-category-name-edit` | Category name field |
| `switch-category-active` | Active/Inactive toggle |
| `btn-cancel-edit-category` | Cancel button |
| `btn-save-category-changes` | Save Changes button |
