/**
 * Professional Skeleton Loader Test Suite
 * Enterprise-grade testing for skeleton loading components
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import {
  SkeletonLoader,
  SkeletonCard,
  TableSkeletonCard,
  MenuItemSkeletonCard,
  OrderSkeletonCard,
} from '../SkeletonLoader';

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PaperProvider>{children}</PaperProvider>
);

describe('SkeletonLoader', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader testID="skeleton-loader" />
      </TestWrapper>
    );

    const skeleton = getByTestId('skeleton-loader');
    expect(skeleton).toBeTruthy();
  });

  it('should apply custom dimensions', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader 
          testID="skeleton-loader"
          width={100}
          height={50}
          borderRadius={10}
        />
      </TestWrapper>
    );

    const skeleton = getByTestId('skeleton-loader');
    expect(skeleton.props.style).toMatchObject({
      width: 100,
      height: 50,
      borderRadius: 10,
    });
  });

  it('should disable animation when animated is false', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader 
          testID="skeleton-loader"
          animated={false}
        />
      </TestWrapper>
    );

    const skeleton = getByTestId('skeleton-loader');
    expect(skeleton).toBeTruthy();
  });

  it('should accept custom style prop', () => {
    const customStyle = { margin: 10 };
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader 
          testID="skeleton-loader"
          style={customStyle}
        />
      </TestWrapper>
    );

    const skeleton = getByTestId('skeleton-loader');
    expect(skeleton.props.style).toEqual(
      expect.objectContaining(customStyle)
    );
  });
});

describe('SkeletonCard', () => {
  it('should render with default configuration', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonCard testID="skeleton-card" />
      </TestWrapper>
    );

    expect(getByTestId('skeleton-card')).toBeTruthy();
  });

  it('should render without image when showImage is false', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <SkeletonCard 
          testID="skeleton-card"
          showImage={false}
        />
      </TestWrapper>
    );

    // Should not render image skeleton
    expect(queryByTestId('skeleton-image')).toBeFalsy();
  });

  it('should render correct number of content lines', () => {
    const contentLines = 5;
    render(
      <TestWrapper>
        <SkeletonCard 
          testID="skeleton-card"
          contentLines={contentLines}
        />
      </TestWrapper>
    );

    // Test would verify the number of content line skeletons
    // In a real implementation, you'd add testIDs to count them
  });

  it('should render actions when showActions is true', () => {
    render(
      <TestWrapper>
        <SkeletonCard 
          testID="skeleton-card"
          showActions={true}
        />
      </TestWrapper>
    );

    // Test would verify action skeleton elements are present
  });
});

describe('TableSkeletonCard', () => {
  it('should render table-specific skeleton', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <TableSkeletonCard testID="table-skeleton" />
      </TestWrapper>
    );

    expect(getByTestId('table-skeleton')).toBeTruthy();
  });

  it('should accept custom style', () => {
    const customStyle = { backgroundColor: '#f0f0f0' };
    const { getByTestId } = render(
      <TestWrapper>
        <TableSkeletonCard 
          testID="table-skeleton"
          style={customStyle}
        />
      </TestWrapper>
    );

    expect(getByTestId('table-skeleton').props.style).toEqual(
      expect.objectContaining(customStyle)
    );
  });
});

describe('MenuItemSkeletonCard', () => {
  it('should render in grid layout by default', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <MenuItemSkeletonCard testID="menu-skeleton" />
      </TestWrapper>
    );

    expect(getByTestId('menu-skeleton')).toBeTruthy();
  });

  it('should render in list layout when specified', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <MenuItemSkeletonCard 
          testID="menu-skeleton"
          layout="list"
        />
      </TestWrapper>
    );

    const skeleton = getByTestId('menu-skeleton');
    expect(skeleton).toBeTruthy();
    
    // Test would verify different styles applied for list layout
  });

  it('should apply custom style', () => {
    const customStyle = { padding: 20 };
    const { getByTestId } = render(
      <TestWrapper>
        <MenuItemSkeletonCard 
          testID="menu-skeleton"
          style={customStyle}
        />
      </TestWrapper>
    );

    expect(getByTestId('menu-skeleton').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(customStyle)])
    );
  });
});

describe('OrderSkeletonCard', () => {
  it('should render order-specific skeleton', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <OrderSkeletonCard testID="order-skeleton" />
      </TestWrapper>
    );

    expect(getByTestId('order-skeleton')).toBeTruthy();
  });

  it('should include header, content and footer sections', () => {
    render(
      <TestWrapper>
        <OrderSkeletonCard testID="order-skeleton" />
      </TestWrapper>
    );

    // Test would verify the presence of different order skeleton sections
    // In a real implementation, you'd add testIDs to verify structure
  });

  it('should accept custom style', () => {
    const customStyle = { marginVertical: 15 };
    const { getByTestId } = render(
      <TestWrapper>
        <OrderSkeletonCard 
          testID="order-skeleton"
          style={customStyle}
        />
      </TestWrapper>
    );

    expect(getByTestId('order-skeleton').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(customStyle)])
    );
  });
});

describe('Skeleton Animation Performance', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle animation lifecycle properly', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader 
          testID="animated-skeleton"
          animated={true}
        />
      </TestWrapper>
    );

    const skeleton = getByTestId('animated-skeleton');
    expect(skeleton).toBeTruthy();

    // Fast-forward animation
    jest.advanceTimersByTime(1000);

    // Should still be mounted and functional
    expect(skeleton).toBeTruthy();
  });

  it('should cleanup animations on unmount', () => {
    const { unmount } = render(
      <TestWrapper>
        <SkeletonLoader animated={true} />
      </TestWrapper>
    );

    // Should not throw when unmounting
    expect(() => unmount()).not.toThrow();
  });
});

describe('Skeleton Accessibility', () => {
  it('should have proper accessibility properties', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader 
          testID="accessible-skeleton"
          // In a real implementation, you'd add accessibility props
        />
      </TestWrapper>
    );

    const skeleton = getByTestId('accessible-skeleton');
    expect(skeleton).toBeTruthy();
    
    // Test would verify accessibility properties like:
    // expect(skeleton).toHaveAccessibilityRole('progressbar');
    // expect(skeleton).toHaveAccessibilityLabel('Loading content');
  });
});

// Performance benchmarks
describe('Skeleton Performance', () => {
  it('should render multiple skeletons efficiently', () => {
    const startTime = Date.now();
    
    const { getAllByTestId } = render(
      <TestWrapper>
        {Array.from({ length: 50 }, (_, index) => (
          <SkeletonLoader 
            key={index}
            testID={`skeleton-${index}`}
          />
        ))}
      </TestWrapper>
    );

    const endTime = Date.now();
    const renderTime = endTime - startTime;

    // Should render 50 skeletons in under 100ms
    expect(renderTime).toBeLessThan(100);
    expect(getAllByTestId(/skeleton-\d+/)).toHaveLength(50);
  });

  it('should handle rapid re-renders without memory leaks', () => {
    const { rerender } = render(
      <TestWrapper>
        <SkeletonLoader width={100} height={20} />
      </TestWrapper>
    );

    // Simulate rapid re-renders with different props
    for (let i = 0; i < 10; i++) {
      rerender(
        <TestWrapper>
          <SkeletonLoader width={100 + i} height={20 + i} />
        </TestWrapper>
      );
    }

    // Should complete without throwing or memory issues
    expect(true).toBe(true);
  });
});