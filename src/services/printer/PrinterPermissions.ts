/**
 * PrinterPermissions — runtime permission helpers for BT/BLE/USB printing.
 */

import { Platform, PermissionsAndroid } from 'react-native';

export interface PermissionResult {
  granted: boolean;
  deniedPermissions?: string[];
}

/** Request Bluetooth permissions (Classic + BLE).
 *  Android 12+: BLUETOOTH_CONNECT + BLUETOOTH_SCAN
 *  Android 11-: BLUETOOTH + BLUETOOTH_ADMIN + ACCESS_FINE_LOCATION
 */
export async function requestBluetoothPermissions(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') {
    // iOS BT is handled automatically by the OS on first use
    return { granted: true };
  }

  const apiLevel = Platform.Version as number;
  const denied: string[] = [];

  if (apiLevel >= 31) {
    // Android 12+
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);
    for (const [perm, result] of Object.entries(results)) {
      if (result !== PermissionsAndroid.RESULTS.GRANTED) denied.push(perm);
    }
  } else {
    // Android 11 and below — BLUETOOTH + BLUETOOTH_ADMIN are not in RN typed enum
    // but still valid permission strings on API <= 30
    const legacyPerms = [
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ] as Parameters<typeof PermissionsAndroid.requestMultiple>[0];
    const results = await PermissionsAndroid.requestMultiple(legacyPerms);
    for (const [perm, result] of Object.entries(results)) {
      if (result !== PermissionsAndroid.RESULTS.GRANTED) denied.push(perm);
    }
  }

  return { granted: denied.length === 0, deniedPermissions: denied.length ? denied : undefined };
}

/** Request location permission required for BLE scan on Android 11-. */
export async function requestBlePermissions(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') return { granted: true };

  const apiLevel = Platform.Version as number;
  if (apiLevel >= 31) {
    // BLE scan on Android 12+ uses BLUETOOTH_SCAN — same as Classic
    return requestBluetoothPermissions();
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );
  return {
    granted: result === PermissionsAndroid.RESULTS.GRANTED,
    deniedPermissions: result !== PermissionsAndroid.RESULTS.GRANTED
      ? [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]
      : undefined,
  };
}

/** Check (without prompting) whether BT permissions are already granted. */
export async function checkBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const apiLevel = Platform.Version as number;
  if (apiLevel >= 31) {
    const [connect, scan] = await Promise.all([
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT),
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN),
    ]);
    return connect && scan;
  }

  const [bt, btAdmin, loc] = await Promise.all([
    PermissionsAndroid.check('android.permission.BLUETOOTH' as Parameters<typeof PermissionsAndroid.check>[0]),
    PermissionsAndroid.check('android.permission.BLUETOOTH_ADMIN' as Parameters<typeof PermissionsAndroid.check>[0]),
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
  ]);
  return bt && btAdmin && loc;
}
