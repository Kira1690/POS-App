/**
 * KitchenConfigContext - Kitchen station configuration management
 * Lightweight context for managing station settings (CRUD).
 * Order data lives in UnifiedOrderContext; this only manages station configs.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import { kitchenStorageService } from '@/services/storage';
import { StationConfig } from '@/types/kitchen-ticket.types';
import { KitchenStation } from '@/types/order-extended.types';

// ============== CONTEXT VALUE TYPE ==============

export interface KitchenConfigContextValue {
  stations: StationConfig[];
  isLoading: boolean;
  refreshStations: () => Promise<void>;
  addStation: (station: string, config: Omit<StationConfig, 'station'>) => Promise<void>;
  updateStation: (station: string, updates: Partial<StationConfig>) => Promise<void>;
  deleteStation: (station: string) => Promise<void>;
  toggleStation: (station: string, isActive: boolean) => Promise<void>;
}

// ============== CONTEXT ==============

const KitchenConfigContext = createContext<KitchenConfigContextValue | undefined>(undefined);

// ============== PROVIDER ==============

interface KitchenConfigProviderProps {
  children: ReactNode;
}

export const KitchenConfigProvider: React.FC<KitchenConfigProviderProps> = ({ children }) => {
  const [stations, setStations] = useState<StationConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStations = useCallback(async () => {
    try {
      const configs = await kitchenStorageService.getStationConfigs();
      setStations(
        [...configs].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      );
    } catch (error) {
      console.error('[KitchenConfigContext] Failed to load stations:', error);
    }
  }, []);

  const addStation = useCallback(
    async (station: string, config: Omit<StationConfig, 'station'>) => {
      await kitchenStorageService.addStationConfig(station, config);
      await refreshStations();
    },
    [refreshStations]
  );

  const updateStation = useCallback(
    async (station: string, updates: Partial<StationConfig>) => {
      await kitchenStorageService.updateStationConfig(station as KitchenStation, updates);
      await refreshStations();
    },
    [refreshStations]
  );

  const deleteStation = useCallback(
    async (station: string) => {
      await kitchenStorageService.deleteStationConfig(station);
      await refreshStations();
    },
    [refreshStations]
  );

  const toggleStation = useCallback(
    async (station: string, isActive: boolean) => {
      await kitchenStorageService.updateStationConfig(station as KitchenStation, { isActive });
      await refreshStations();
    },
    [refreshStations]
  );

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await refreshStations();
      setIsLoading(false);
    };
    init();
  }, [refreshStations]);

  const contextValue: KitchenConfigContextValue = useMemo(() => ({
    stations, isLoading, refreshStations,
    addStation, updateStation, deleteStation, toggleStation,
  }), [stations, isLoading, refreshStations, addStation, updateStation, deleteStation, toggleStation]);

  return (
    <KitchenConfigContext.Provider value={contextValue}>
      {children}
    </KitchenConfigContext.Provider>
  );
};

// ============== HOOKS ==============

export const useKitchenConfig = (): KitchenConfigContextValue => {
  const context = useContext(KitchenConfigContext);
  if (!context) {
    throw new Error('useKitchenConfig must be used within a KitchenConfigProvider');
  }
  return context;
};
