/**
 * Auth Context - Simple context definition and hook
 * Under 50 lines, single responsibility
 */

import React, { createContext, useContext } from 'react';
import { IAuthContext } from '@/interfaces';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;