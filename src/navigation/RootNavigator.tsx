import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuth } from '@/context/auth/AuthContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { performanceAnalytics } from '@/services/analytics/PerformanceAnalyticsService';
import { MemoryTracker } from '@/utils/performance';
import { AppState, AppStateStatus } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { state } = useAuth();
  const isAuthenticated = state.isAuthenticated;
  
  // Professional performance monitoring initialization
  useEffect(() => {
    const memoryTracker = MemoryTracker.getInstance();
    memoryTracker.startTracking(30000); // Check every 30 seconds
    
    // Track app lifecycle for performance analytics
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Flush analytics when app goes to background
        performanceAnalytics.flush();
        memoryTracker.stopTracking();
      } else if (nextAppState === 'active') {
        // Resume tracking when app becomes active
        memoryTracker.startTracking(30000);
        performanceAnalytics.trackBusinessEvent('app_resumed', {
          impact: 'user_engagement',
          session_id: performanceAnalytics.getRealTimeMetrics().current_session,
        });
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Initial performance event
    performanceAnalytics.trackBusinessEvent('app_launched', {
      is_authenticated: isAuthenticated,
      impact: 'app_usage',
    });
    
    return () => {
      subscription?.remove();
      memoryTracker.stopTracking();
      performanceAnalytics.flush();
    };
  }, [isAuthenticated]);

  return (
    <ErrorBoundary>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // Professional navigation performance
          animationEnabled: true,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, next, layouts }) => {
            // Professional 60fps navigation animation
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen 
            name="Main" 
            component={MainNavigator}
            listeners={{
              focus: () => {
                // Navigation duration not measurable from focus listener — pass 0
              },
            }}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            listeners={{
              focus: () => {
                // Navigation duration not measurable from focus listener — pass 0
              },
            }}
          />
        )}
      </Stack.Navigator>
    </ErrorBoundary>
  );
};