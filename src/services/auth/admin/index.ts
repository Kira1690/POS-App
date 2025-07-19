/**
 * Admin Service Index
 * Clean exports for admin service
 */

export { AdminService } from './AdminService';

// Create and export singleton instance
import { AdminService } from './AdminService';

export const adminService = new AdminService();