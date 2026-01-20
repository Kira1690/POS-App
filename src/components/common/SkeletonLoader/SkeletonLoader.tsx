/**
 * Professional Skeleton Loader Component
 * Enterprise-grade loading placeholders with smooth animations
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  shimmerColor?: string;
  baseColor?: string;
  animated?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  shimmerColor,
  baseColor,
  animated = true,
}) => {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const defaultBaseColor = baseColor || theme.colors.surfaceVariant;
  const defaultShimmerColor = shimmerColor || theme.colors.surface;

  useEffect(() => {
    if (!animated) return;

    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, [shimmerAnim, animated]);

  const animatedBackgroundColor = animated
    ? shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [defaultBaseColor, defaultShimmerColor],
      })
    : defaultBaseColor;

  return (
    <Animated.View
      style={StyleSheet.flatten([
        styles.skeleton,
        {
          width: width as ViewStyle['width'],
          height,
          borderRadius,
          backgroundColor: animatedBackgroundColor,
        },
        style,
      ]) as any}
    />
  );
};

/**
 * Professional Skeleton Card for complex layouts
 */
interface SkeletonCardProps {
  style?: ViewStyle;
  showImage?: boolean;
  imageStyle?: ViewStyle;
  showTitle?: boolean;
  titleStyle?: ViewStyle;
  showSubtitle?: boolean;
  subtitleStyle?: ViewStyle;
  showContent?: boolean;
  contentLines?: number;
  contentStyle?: ViewStyle;
  showActions?: boolean;
  actionsStyle?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  style,
  showImage = true,
  imageStyle,
  showTitle = true,
  titleStyle,
  showSubtitle = false,
  subtitleStyle,
  showContent = true,
  contentLines = 3,
  contentStyle,
  showActions = false,
  actionsStyle,
}) => {
  return (
    <View style={[styles.skeletonCard, style]}>
      {showImage && (
        <SkeletonLoader
          width="100%"
          height={120}
          borderRadius={8}
          style={StyleSheet.flatten([styles.skeletonImage, imageStyle])}
        />
      )}
      
      <View style={styles.skeletonCardContent}>
        {showTitle && (
          <SkeletonLoader
            width="80%"
            height={18}
            style={StyleSheet.flatten([styles.skeletonTitle, titleStyle])}
          />
        )}
        
        {showSubtitle && (
          <SkeletonLoader
            width="60%"
            height={14}
            style={StyleSheet.flatten([styles.skeletonSubtitle, subtitleStyle])}
          />
        )}
        
        {showContent && (
          <View style={[styles.skeletonContentContainer, contentStyle]}>
            {Array.from({ length: contentLines }).map((_, index) => (
              <SkeletonLoader
                key={index}
                width={index === contentLines - 1 ? '70%' : '100%'}
                height={12}
                style={styles.skeletonContentLine}
              />
            ))}
          </View>
        )}
        
        {showActions && (
          <View style={[styles.skeletonActions, actionsStyle]}>
            <SkeletonLoader width={80} height={32} borderRadius={16} />
            <SkeletonLoader width={80} height={32} borderRadius={16} />
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Professional Table Skeleton
 */
export const TableSkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.tableSkeletonCard, style]}>
      <SkeletonLoader
        width="100%"
        height={60}
        borderRadius={12}
        style={styles.tableSkeletonMain}
      />
      <View style={styles.tableSkeletonInfo}>
        <SkeletonLoader width="60%" height={12} style={styles.tableSkeletonText} />
        <SkeletonLoader width="40%" height={10} />
      </View>
    </View>
  );
};

/**
 * Professional Menu Item Skeleton
 */
export const MenuItemSkeletonCard: React.FC<{ 
  layout?: 'grid' | 'list';
  style?: ViewStyle;
}> = ({ layout = 'grid', style }) => {
  const isGrid = layout === 'grid';

  return (
    <View style={[
      styles.menuItemSkeletonCard,
      isGrid ? styles.menuItemSkeletonGrid : styles.menuItemSkeletonList,
      style
    ]}>
      {/* Image */}
      <SkeletonLoader
        width={isGrid ? '100%' : 80}
        height={isGrid ? 120 : 80}
        borderRadius={8}
        style={isGrid ? styles.menuSkeletonImageGrid : styles.menuSkeletonImageList}
      />
      
      {/* Content */}
      <View style={[
        styles.menuSkeletonContent,
        isGrid ? styles.menuSkeletonContentGrid : styles.menuSkeletonContentList
      ]}>
        <SkeletonLoader width="90%" height={16} style={styles.menuSkeletonTitle} />
        <SkeletonLoader width="100%" height={12} style={styles.menuSkeletonDescription} />
        {isGrid && <SkeletonLoader width="70%" height={12} />}
        
        <View style={styles.menuSkeletonFooter}>
          <SkeletonLoader width={60} height={18} />
          <SkeletonLoader width={32} height={32} borderRadius={16} />
        </View>
      </View>
    </View>
  );
};

/**
 * Professional Order Item Skeleton
 */
export const OrderSkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.orderSkeletonCard, style]}>
      <View style={styles.orderSkeletonHeader}>
        <SkeletonLoader width={100} height={14} />
        <SkeletonLoader width={60} height={20} borderRadius={10} />
      </View>
      
      <View style={styles.orderSkeletonContent}>
        <SkeletonLoader width="80%" height={12} style={styles.orderSkeletonLine} />
        <SkeletonLoader width="60%" height={12} style={styles.orderSkeletonLine} />
        <SkeletonLoader width="90%" height={12} />
      </View>
      
      <View style={styles.orderSkeletonFooter}>
        <SkeletonLoader width={80} height={16} />
        <SkeletonLoader width={100} height={28} borderRadius={14} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  
  // Skeleton Card
  skeletonCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  skeletonImage: {
    marginBottom: 12,
  },
  skeletonCardContent: {
    flex: 1,
  },
  skeletonTitle: {
    marginBottom: 8,
  },
  skeletonSubtitle: {
    marginBottom: 12,
  },
  skeletonContentContainer: {
    marginBottom: 16,
  },
  skeletonContentLine: {
    marginBottom: 6,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  
  // Table Skeleton
  tableSkeletonCard: {
    padding: 12,
    margin: 4,
    borderRadius: 8,
    minHeight: 100,
  },
  tableSkeletonMain: {
    marginBottom: 8,
  },
  tableSkeletonInfo: {
    gap: 4,
  },
  tableSkeletonText: {
    marginBottom: 4,
  },
  
  // Menu Item Skeleton
  menuItemSkeletonCard: {
    padding: 12,
    margin: 4,
    borderRadius: 12,
  },
  menuItemSkeletonGrid: {
    minHeight: 200,
  },
  menuItemSkeletonList: {
    flexDirection: 'row',
    minHeight: 100,
  },
  menuSkeletonImageGrid: {
    marginBottom: 12,
  },
  menuSkeletonImageList: {
    marginRight: 12,
  },
  menuSkeletonContent: {
    flex: 1,
  },
  menuSkeletonContentGrid: {
    gap: 6,
  },
  menuSkeletonContentList: {
    gap: 4,
  },
  menuSkeletonTitle: {
    marginBottom: 4,
  },
  menuSkeletonDescription: {
    marginBottom: 8,
  },
  menuSkeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  
  // Order Skeleton
  orderSkeletonCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  orderSkeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderSkeletonContent: {
    marginBottom: 12,
    gap: 6,
  },
  orderSkeletonLine: {
    marginBottom: 4,
  },
  orderSkeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default SkeletonLoader;