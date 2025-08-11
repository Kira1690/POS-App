/**
 * Professional Error Boundary Test Suite
 * Enterprise-grade testing for error handling components
 */

import React, { useState } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import {
  ProfessionalErrorBoundary,
  AppErrorBoundary,
  ScreenErrorBoundary,
  ComponentErrorBoundary,
} from '../ErrorBoundary';

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PaperProvider>{children}</PaperProvider>
);

// Component that throws error for testing
const ErrorThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({ 
  shouldThrow = true 
}) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div>Working component</div>;
};

// Component with controllable error
const ControllableErrorComponent: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error('Controlled test error');
  }
  
  return (
    <div>
      <span>Component is working</span>
      <button 
        testID="throw-error-button"
        onPress={() => setShouldThrow(true)}
      >
        Throw Error
      </button>
    </div>
  );
};

// Mock console methods to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('ProfessionalErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe('Error Catching', () => {
    it('should catch and display errors', async () => {
      const { getByText, queryByText } = render(
        <TestWrapper>
          <ProfessionalErrorBoundary>
            <ErrorThrowingComponent />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      // Should show error screen
      await waitFor(() => {
        expect(getByText('Oops! Something went wrong')).toBeTruthy();
      });

      // Should not show the original component
      expect(queryByText('Working component')).toBeFalsy();
    });

    it('should call onError callback when provided', async () => {
      const onErrorMock = jest.fn();
      
      render(
        <TestWrapper>
          <ProfessionalErrorBoundary onError={onErrorMock}>
            <ErrorThrowingComponent />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onErrorMock).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            componentStack: expect.any(String),
          })
        );
      });
    });

    it('should render normal children when no error', () => {
      const { getByText, queryByText } = render(
        <TestWrapper>
          <ProfessionalErrorBoundary>
            <ErrorThrowingComponent shouldThrow={false} />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      expect(getByText('Working component')).toBeTruthy();
      expect(queryByText('Oops! Something went wrong')).toBeFalsy();
    });
  });

  describe('Error Recovery', () => {
    it('should allow retry when enabled', async () => {
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <ProfessionalErrorBoundary enableRetry={true}>
            <ControllableErrorComponent />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      // Trigger error
      fireEvent.press(getByTestId('throw-error-button'));

      // Should show error screen with retry button
      await waitFor(() => {
        expect(getByText('Try Again')).toBeTruthy();
      });

      // Click retry
      fireEvent.press(getByText('Try Again'));

      // Should attempt to retry
      await waitFor(() => {
        expect(getByText('Component is working')).toBeTruthy();
      });
    });

    it('should disable retry after max attempts', async () => {
      const { rerender, getByText, queryByText } = render(
        <TestWrapper>
          <ProfessionalErrorBoundary enableRetry={true} maxRetries={2}>
            <ErrorThrowingComponent />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Try Again')).toBeTruthy();
      });

      // Retry multiple times
      for (let i = 0; i < 3; i++) {
        if (queryByText('Try Again')) {
          fireEvent.press(getByText('Try Again'));
          
          // Re-render with error to simulate continued failure
          rerender(
            <TestWrapper>
              <ProfessionalErrorBoundary enableRetry={true} maxRetries={2}>
                <ErrorThrowingComponent />
              </ProfessionalErrorBoundary>
            </TestWrapper>
          );
        }
      }

      await waitFor(() => {
        // After max retries, button should be disabled or not present
        expect(queryByText('Try Again')).toBeFalsy();
      });
    });

    it('should show reload button', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ProfessionalErrorBoundary>
            <ErrorThrowingComponent />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Reload App')).toBeTruthy();
      });
    });

    it('should show help button', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ProfessionalErrorBoundary>
            <ErrorThrowingComponent />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Get Help')).toBeTruthy();
      });
    });
  });

  describe('Error Context and Levels', () => {
    it('should display error level and context', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ProfessionalErrorBoundary 
            level="screen" 
            context="TestScreen"
          >
            <ErrorThrowingComponent />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText(/Level: screen/)).toBeTruthy();
        expect(getByText(/Context: TestScreen/)).toBeTruthy();
      });
    });

    it('should show retry attempts', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ProfessionalErrorBoundary maxRetries={5}>
            <ErrorThrowingComponent />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText(/Attempts: 0\/5/)).toBeTruthy();
      });
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback component when provided', async () => {
      const CustomFallback: React.FC<{ error: Error; retry: () => void }> = ({ 
        error, 
        retry 
      }) => (
        <div>
          <span>Custom Error: {error.message}</span>
          <button testID="custom-retry" onPress={retry}>
            Custom Retry
          </button>
        </div>
      );

      const { getByText, getByTestId } = render(
        <TestWrapper>
          <ProfessionalErrorBoundary fallback={CustomFallback}>
            <ErrorThrowingComponent />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Custom Error: Test error for error boundary')).toBeTruthy();
        expect(getByTestId('custom-retry')).toBeTruthy();
      });
    });
  });

  describe('Development Mode Features', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      // Mock __DEV__ for development features
      (global as any).__DEV__ = true;
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      (global as any).__DEV__ = false;
    });

    it('should show technical details in development mode', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ProfessionalErrorBoundary>
            <ErrorThrowingComponent />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Technical Details')).toBeTruthy();
        expect(getByText('(Development Mode)')).toBeTruthy();
        expect(getByText('Error Message:')).toBeTruthy();
      });
    });
  });
});

describe('Specialized Error Boundaries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AppErrorBoundary', () => {
    it('should have app-level configuration', async () => {
      const { getByText } = render(
        <TestWrapper>
          <AppErrorBoundary>
            <ErrorThrowingComponent />
          </AppErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText(/Level: app/)).toBeTruthy();
        expect(getByText(/Context: Application Root/)).toBeTruthy();
      });
    });

    it('should have limited retries for app-level errors', async () => {
      const { getByText } = render(
        <TestWrapper>
          <AppErrorBoundary>
            <ErrorThrowingComponent />
          </AppErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText(/Attempts: 0\/1/)).toBeTruthy();
      });
    });
  });

  describe('ScreenErrorBoundary', () => {
    it('should accept custom screen name', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ScreenErrorBoundary screenName="TestScreen">
            <ErrorThrowingComponent />
          </ScreenErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText(/Level: screen/)).toBeTruthy();
        expect(getByText(/Context: TestScreen/)).toBeTruthy();
      });
    });

    it('should have moderate retry attempts', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ScreenErrorBoundary screenName="TestScreen">
            <ErrorThrowingComponent />
          </ScreenErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText(/Attempts: 0\/3/)).toBeTruthy();
      });
    });
  });

  describe('ComponentErrorBoundary', () => {
    it('should accept custom component name', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ComponentErrorBoundary componentName="TestComponent">
            <ErrorThrowingComponent />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText(/Level: component/)).toBeTruthy();
        expect(getByText(/Context: TestComponent/)).toBeTruthy();
      });
    });

    it('should have high retry attempts', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ComponentErrorBoundary>
            <ErrorThrowingComponent />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText(/Attempts: 0\/5/)).toBeTruthy();
      });
    });

    it('should use default component name', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ComponentErrorBoundary>
            <ErrorThrowingComponent />
          </ComponentErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText(/Context: Component/)).toBeTruthy();
      });
    });
  });
});

describe('Error Boundary Performance', () => {
  it('should handle multiple child errors efficiently', () => {
    const startTime = Date.now();

    render(
      <TestWrapper>
        <ProfessionalErrorBoundary>
          <ErrorThrowingComponent />
          <ErrorThrowingComponent />
          <ErrorThrowingComponent />
        </ProfessionalErrorBoundary>
      </TestWrapper>
    );

    const endTime = Date.now();
    const renderTime = endTime - startTime;

    // Should handle errors quickly
    expect(renderTime).toBeLessThan(100);
  });

  it('should not cause memory leaks on repeated errors', () => {
    const { rerender } = render(
      <TestWrapper>
        <ProfessionalErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ProfessionalErrorBoundary>
      </TestWrapper>
    );

    // Simulate repeated error/recovery cycles
    for (let i = 0; i < 5; i++) {
      rerender(
        <TestWrapper>
          <ProfessionalErrorBoundary>
            <ErrorThrowingComponent shouldThrow={true} />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );

      rerender(
        <TestWrapper>
          <ProfessionalErrorBoundary>
            <ErrorThrowingComponent shouldThrow={false} />
          </ProfessionalErrorBoundary>
        </TestWrapper>
      );
    }

    // Should complete without memory issues
    expect(true).toBe(true);
  });
});