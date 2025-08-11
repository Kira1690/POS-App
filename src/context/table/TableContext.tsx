/**
 * Table Context - Simple context definition and hook
 * Under 50 lines, single responsibility
 */

import React, { createContext, useContext } from 'react';
import { ITableContext } from '@/interfaces';

const TableContext = createContext<ITableContext | undefined>(undefined);

export const useTable = (): ITableContext => {
  const context = useContext(TableContext);
  
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider');
  }
  
  return context;
};

export default TableContext;