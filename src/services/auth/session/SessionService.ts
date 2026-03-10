/**
 * Session Service - Simple, focused session management
 * Under 100 lines, single responsibility for session operations
 */

import { authApiClient } from '@/services/api/authApiClient';
import { SessionInfo } from '@/types';

export class SessionService {
  
  async getSessions(): Promise<SessionInfo[]> {
    try {
      return await authApiClient.getSessions();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get sessions');
    }
  }

  async getSessionInfo(sessionId: string): Promise<SessionInfo> {
    try {
      return await authApiClient.getSessionInfo(sessionId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get session info');
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    try {
      await authApiClient.revokeSession(sessionId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to revoke session');
    }
  }

  async revokeOtherSessions(): Promise<void> {
    try {
      await authApiClient.revokeOtherSessions();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to revoke other sessions');
    }
  }

  async revokeAllSessions(): Promise<void> {
    try {
      await authApiClient.revokeAllSessions();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to revoke all sessions');
    }
  }
}