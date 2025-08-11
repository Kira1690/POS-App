/**
 * Table Grid Component - Grid layout for tables
 * Under 200 lines, single responsibility for table grid display
 */

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Dimensions,
  ListRenderItem,
  ActivityIndicator 
} from 'react-native';
import { Table, TableGridConfig } from '@/types/table.types';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/design-system/theme/spacing';
import TableCard from './TableCard';
import { usePerformanceMonitoring, useFlatListOptimization } from '@/hooks/usePerformanceMonitoring';
import { TableSkeletonCard } from '@/components/common/SkeletonLoader';
import { FadeInAnimation, SlideInAnimation } from '@/components/common/ProfessionalAnimations';

interface TableGridProps {
  tables: Table[];
  selectedTableId?: string;
  onTableSelect: (table: Table) => void;
  onTableLongPress: (table: Table) => void;
  gridConfig?: TableGridConfig;
  isLoading?: boolean;
  numColumns?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const TableGrid: React.FC<TableGridProps> = memo(({
  tables,
  selectedTableId,
  onTableSelect,
  onTableLongPress,
  gridConfig = { rows: 5, cols: 5, total: 25 },
  isLoading = false,
  numColumns,
}) => {
  const { theme } = useTheme();
  
  // Professional performance monitoring
  const { startTracking, endTracking } = usePerformanceMonitoring({
    componentName: 'TableGrid',
    enableMemoryTracking: true,
    trackReRenders: true,
  });
  
  // Professional FlatList optimization - MUST be called before any conditional logic
  const flatListOptimization = useFlatListOptimization(tables.length || 25, 110);
  
  useEffect(() => {
    startTracking();
    return () => {
      endTracking();
    };
  }, [startTracking, endTracking]);

  // Calculate optimal number of columns based on screen width
  const calculatedNumColumns = useMemo(() => {
    if (numColumns) return numColumns;
    
    const minCardWidth = 120;
    const totalPadding = spacing.lg * 2; // Container padding
    const availableWidth = screenWidth - totalPadding;
    const cardSpacing = spacing.md;
    
    const cols = Math.floor((availableWidth + cardSpacing) / (minCardWidth + cardSpacing));
    return Math.max(2, Math.min(cols, gridConfig.cols));
  }, [numColumns, gridConfig.cols]);

  // Create grid data with empty slots if needed (Professional memoization)
  const gridData = useMemo(() => {
    const startTime = performance.now();
    const totalSlots = gridConfig.total;
    const data = [...tables];
    
    // Fill empty slots to maintain grid structure
    while (data.length < totalSlots) {
      data.push({
        id: `empty_${data.length}`,
        restaurant_id: '',
        table_number: `${data.length + 1}`,
        capacity: 4,
        status: 'available' as any,
        created_at: '',
        updated_at: '',
        is_active: true,
        is_deleted: false,
      });
    }
    
    const endTime = performance.now();
    if (__DEV__ && endTime - startTime > 5) {
      console.log(`⚡ TableGrid gridData computation: ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return data;
  }, [tables, gridConfig.total]);

  const handleTableSelect = useCallback((table: Table) => {
    if (table.id.startsWith('empty_')) return;
    onTableSelect(table);
  }, [onTableSelect]);

  const handleTableLongPress = useCallback((table: Table) => {
    if (table.id.startsWith('empty_')) return;
    onTableLongPress(table);
  }, [onTableLongPress]);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (__DEV__ && viewableItems.length > 20) {
      console.log(`📊 TableGrid viewable items: ${viewableItems.length}`);
    }
  }, []);

  const renderTableItem: ListRenderItem<Table> = useCallback(({ item: table, index }) => {
    const isSelected = table.id === selectedTableId;
    const isEmpty = table.id.startsWith('empty_');
    
    return (
      <View style={styles.tableItemWrapper}>
        <SlideInAnimation
          direction="up"
          delay={index * 50} // Staggered animation
          duration={300}
          style={[styles.tableContainer, { 
            opacity: isEmpty ? 0.3 : 1,
          }]}
        >
          <TableCard
            table={table}
            isSelected={isSelected}
            onPress={() => handleTableSelect(table)}
            onLongPress={() => handleTableLongPress(table)}
            size="medium"
          />
        </SlideInAnimation>
      </View>
    );
  }, [selectedTableId, handleTableSelect, handleTableLongPress]);

  const keyExtractor = useCallback((item: Table) => item.id, []);

  const getItemLayout = useCallback((data: any, index: number) => {
    const itemHeight = 100; // Approximate height including margin
    const itemsPerRow = calculatedNumColumns;
    const rowIndex = Math.floor(index / itemsPerRow);
    
    return {
      length: itemHeight,
      offset: itemHeight * rowIndex,
      index,
    };
  }, [calculatedNumColumns]);

  // Professional skeleton loading state
  const renderSkeletonGrid = () => {
    const skeletonItems = Array.from({ length: gridConfig.total }, (_, index) => index);
    
    return (
      <FlatList
        data={skeletonItems}
        renderItem={({ item, index }) => (
          <View style={styles.tableItemWrapper}>
            <FadeInAnimation 
              delay={index * 30}
              style={styles.tableContainer}
            >
              <TableSkeletonCard />
            </FadeInAnimation>
          </View>
        )}
        keyExtractor={(item) => `skeleton_${item}`}
        numColumns={calculatedNumColumns}
        key={`skeleton_${calculatedNumColumns}`}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={8}
        removeClippedSubviews={true}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderSkeletonGrid()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={gridData}
        renderItem={renderTableItem}
        keyExtractor={keyExtractor}
        numColumns={calculatedNumColumns}
        key={calculatedNumColumns} // Force re-render when columns change
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        // Enhanced performance settings
        disableIntervalMomentum={true}
        disableScrollViewPanResponder={false}
        legacyImplementation={false}
        // Professional memory management from optimization hook (excluding duplicates)
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        onEndReachedThreshold={0.8}
        onViewableItemsChanged={handleViewableItemsChanged}
      />
    </View>
  );
});

TableGrid.displayName = 'TableGrid';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    paddingBottom: spacing.xl,
    alignItems: 'stretch', // Professional alignment
  },
  tableItemWrapper: {
    flex: 1, // Professional flex-based layout
    minWidth: 0, // Prevent flex shrinking issues
    paddingHorizontal: spacing.xs / 2, // Professional spacing
  },
  tableContainer: {
    flex: 1, // Professional flex layout
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90, // Professional minimum height
  },
});

export default TableGrid;