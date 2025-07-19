/**
 * Profile Hook - Simple profile management utilities
 * Under 100 lines, single responsibility for profile operations
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { UpdateProfileRequest } from '@/interfaces';

export const useProfile = () => {
  const { state, updateProfile, updatePassword, refreshUserData } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = useCallback(async (userData: UpdateProfileRequest) => {
    setIsUpdating(true);
    setError(null);

    try {
      await updateProfile(userData);
      return true;
    } catch (error: any) {
      setError(error.message || 'Profile update failed');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [updateProfile]);

  const handleUpdatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setIsUpdating(true);
    setError(null);

    try {
      await updatePassword(currentPassword, newPassword);
      return true;
    } catch (error: any) {
      setError(error.message || 'Password update failed');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [updatePassword]);

  const handleRefreshProfile = useCallback(async () => {
    setIsUpdating(true);
    setError(null);

    try {
      await refreshUserData();
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to refresh profile');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [refreshUserData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user: state.user,
    isUpdating,
    error,
    
    // Actions
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
    refreshProfile: handleRefreshProfile,
    clearError,
  };
};