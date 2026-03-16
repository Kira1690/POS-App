# Printer Setup Guide — POS App

## Supported Connection Methods

The app supports **4 connection methods**. Choose whichever is easiest for your setup:

| Method | Best For | What You Need |
|--------|----------|---------------|
| **Wi-Fi / LAN** | Wired printers on your network | Ethernet cable + router |
| **Wi-Fi Direct (TCP)** | Wireless printers with built-in Wi-Fi | Printer's Wi-Fi IP address |
| **Bluetooth** | Portable/wireless printers | Bluetooth-enabled printer |
| **BLE** | Modern low-energy printers | BLE-compatible printer |

---

## Supported Printers

Any **ESC/POS compatible** thermal receipt printer, including:

- **Epson** TM-T88VI, TM-T88V, TM-T82III, TM-M30II, TM-M30III
- **Star Micronics** TSP143IV (Wi-Fi/Bluetooth models)
- **MUNBYN** ITPP047 (Bluetooth + Wi-Fi)
- **RONGTA** RP326, RP80 (Bluetooth + Wi-Fi)
- **Xprinter** XP-80C, XP-58 (Bluetooth + Wi-Fi)
- Any generic 58mm/80mm ESC/POS thermal printer with LAN, Bluetooth, or BLE

---

## Option A: Wi-Fi / Wireless TCP (Recommended — Easiest)

This works with printers that have **built-in Wi-Fi** or are connected to your router via Ethernet. No cables between tablet and printer.

### Setup

1. **Connect your printer to your Wi-Fi network:**
   - **Wi-Fi printers** (e.g., Epson TM-M30II-NT, MUNBYN wireless): Use the printer's control panel or setup app to join your Wi-Fi network
   - **Ethernet printers** (e.g., Epson TM-T88VI): Plug Ethernet cable into printer and router
   - Both methods give the printer an IP address on your network

2. **Find the printer's IP address:**
   - Hold the **Feed** button while powering on — prints a self-test page with IP
   - Or check your router's admin page for connected devices
   - Example: `192.168.1.105`

3. **Configure in the POS App:**
   - Go to **Settings** tab (gear icon, bottom-right)
   - Scroll to **Printer Management**
   - Under **Receipt Printer**:
     - Toggle **Enable** ON
     - Connection Type: tap **LAN**
     - **IP Address**: enter `192.168.1.105` (your printer's IP)
     - **Port**: leave as `9100`
     - **Paper Size**: select `80mm` or `58mm`
   - Tap **Test** — green checkmark = connected
   - Tap **Print Test Page** — sample receipt should print
   - Tap **Save Settings**

> **Tip:** You can also tap **"Scan Network"** to automatically discover printers on your network instead of typing the IP manually.

---

## Option B: Bluetooth (No Wi-Fi Needed)

Best for **portable thermal printers** or setups without a network. The tablet connects directly to the printer via Bluetooth.

### Setup

1. **Enable Bluetooth on the printer:**
   - Power on the printer
   - Make sure Bluetooth is enabled (blue LED blinking — check your printer's manual)
   - Put the printer in **pairing mode** if required

2. **Configure in the POS App:**
   - Go to **Settings > Printer Management**
   - Under **Receipt Printer**:
     - Toggle **Enable** ON
     - Connection Type: tap **Bluetooth**
   - Tap **"Scan for Bluetooth Printers"**
   - A scan modal will open — tap **Scan**
   - Wait for your printer to appear in the list
   - **Tap your printer** — it auto-fills the MAC address and device name
   - Tap **Test** — green checkmark = connected
   - Tap **Print Test Page**
   - Tap **Save Settings**

3. **If the app asks for permissions**, tap **Allow** for:
   - Bluetooth permissions
   - Nearby devices permission

> **Note:** Bluetooth range is typically 10-15 meters. Keep the tablet within range of the printer.

---

## Option C: BLE (Bluetooth Low Energy)

Works with newer printers that support BLE. Setup is identical to Bluetooth:

1. Go to **Settings > Printer Management**
2. Connection Type: tap **BLE**
3. Tap **"Scan for BLE Printers"**
4. Select your printer from the list
5. Test, Print Test Page, Save

> **Note:** BLE requires **Location permission** on Android. Tap Allow when prompted.

---

## Option D: USB (Direct Cable)

For printers connected directly to the tablet via USB OTG cable:

1. Plug the printer into the tablet using a **USB OTG adapter**
2. Go to **Settings > Printer Management**
3. Connection Type: tap **USB**
4. Tap **"Detect USB Printer"** — it auto-detects the connected printer
5. Test, Print Test Page, Save

---

## Kitchen Printer (KOT) Setup

If you have a **separate printer in the kitchen** for Kitchen Order Tickets:

1. Scroll to **Kitchen Printer** section
2. Toggle **Enable** ON
3. Choose connection type (LAN, Bluetooth, BLE, or USB)
4. Follow the same steps as receipt printer above
5. Tap **Test**, then **Save Settings**

> **One printer for everything?** Configure the same printer for both Receipt and Kitchen. Same IP (for LAN) or same Bluetooth device.

---

## Station Printers (Optional — Multi-Kitchen)

If your restaurant has multiple stations (hot kitchen, cold kitchen, bar, grill) with dedicated printers:

1. Set up stations in **Settings > Kitchen Management** first
2. Back in **Printer Management**, scroll to **Station Printers**
3. Tap a station (e.g., "Hot Kitchen") to expand
4. Choose connection type + enter address (or scan)
5. Test + Save

**How it works:** When a KOT prints, items go to their station's printer automatically. Items without a station printer go to the default kitchen printer.

---

## Which Connection Should I Choose?

| Your Situation | Recommendation |
|----------------|----------------|
| Printer has **Ethernet port** and you have a **router** | **LAN** — most reliable, fastest |
| Printer has **built-in Wi-Fi** | **LAN (TCP)** — enter the printer's Wi-Fi IP |
| Printer is **Bluetooth only** (portable, no network) | **Bluetooth** — tap Scan, select, done |
| Printer is **modern BLE** model | **BLE** — same as Bluetooth, lower power |
| Printer is **right next to tablet** via cable | **USB** — simplest, no network needed |
| **No idea** / just want it to work | Try **Bluetooth scan** first — it's the easiest |

---

## Troubleshooting

### Cannot Connect (LAN/Wi-Fi)

| Problem | Solution |
|---------|----------|
| Wrong IP | Print self-test page (hold Feed + power on) to get correct IP |
| Different network | Tablet and printer must be on the **same Wi-Fi** |
| IP changed | Router may have reassigned IP — recheck via self-test |
| Port blocked | Ensure port **9100** is open on your router |

### Cannot Connect (Bluetooth)

| Problem | Solution |
|---------|----------|
| Printer not found in scan | Make sure Bluetooth is ON and printer is in pairing mode |
| Permission denied | Go to Android Settings > Apps > POS App > Permissions > enable Bluetooth + Nearby Devices |
| Paired but won't print | Unpair from Android Bluetooth settings, then re-scan from POS app |

### Test Passes But Nothing Prints

- Check printer has **paper loaded** (thermal roll, print-side up)
- Power cycle the printer (off 10 seconds, then on)
- Check paper size setting matches your roll (80mm vs 58mm)

### "Printer Not Configured" Message

- Go to Settings > Printer Management
- Make sure printer is **Enabled** (toggle ON)
- Make sure address is filled in
- Tap **Save Settings** (must save before printing works)

---

## Quick Test Checklist

After setup, test the full flow:

- [ ] **Test Connection** — green checkmark on all configured printers
- [ ] **Print Test Page** — sample receipt prints cleanly
- [ ] **Create a test order** — Order Management > New Order > select table > add items > Send to Kitchen
- [ ] **KOT printed** — kitchen printer prints the order ticket
- [ ] **Process payment** — mark order Served, then process payment
- [ ] **Receipt printed** — receipt printer prints the customer bill

---

## Network Diagram

```
OPTION A — Wi-Fi / LAN:

  [Wi-Fi Router]
       |
       |--- Ethernet or Wi-Fi --- [Receipt Printer]  (192.168.1.105:9100)
       |--- Ethernet or Wi-Fi --- [Kitchen Printer]  (192.168.1.106:9100)
       |--- Wi-Fi -------------- [Android Tablet]    (POS App)


OPTION B — Bluetooth (no network needed):

  [Android Tablet] ))) Bluetooth ((( [Receipt Printer]
                   ))) Bluetooth ((( [Kitchen Printer]
```

---

## Login Credentials (for testing)

- **Manager Login**: `manager@foodcorner.com` / `manager123`
- **Staff Login**: `EMP001` / `staff123`

---

## Need Help?

If you face issues, go to **Settings > System Logs** in the app:
1. Tap the **Printer** filter to see all print events and errors
2. Tap **Export** to share logs via WhatsApp or Email for remote debugging
