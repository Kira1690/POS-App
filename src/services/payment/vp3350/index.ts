/**
 * VP3350 Device Service Module Exports
 * Provides clean interface for VP3350 device functionality
 */

export { vp3350DeviceService, default as VP3350DeviceService } from './VP3350DeviceService';
export type { 
  IVP3350DeviceService, 
  VP3350PaymentRequest,
  DeviceConnection 
} from './VP3350DeviceService';