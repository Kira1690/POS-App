/**
 * Legacy AuthContext - Redirects to new structure
 * This file maintains backward compatibility
 */

// Re-export from new structure
export { useAuth, AuthProvider } from './auth';
export type { IAuthContext } from '@/interfaces';

// For backward compatibility, also export default
export { default } from './auth/AuthContext';