/**
 * Professional Error Boundary System
 * Enterprise-grade error handling with recovery options and analytics
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  Button, 
  Card, 
  Icon, 
  useTheme,
  Surface,
  Chip,
  Divider
} from 'react-native-paper';
import { performanceMonitor } from '@/utils/performance';

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: Error | null;
  errorId: string | null;
  canRetry: boolean;
  retryCount: number;
  errorDetails: ErrorDetails | null;
}

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  level?: 'app' | 'screen' | 'component';
  context?: string;
}

/**
 * Professional Error Boundary with comprehensive error handling
 */
export class ProfessionalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorInfo: null,
      errorId: null,
      canRetry: props.enableRetry !== false,
      retryCount: 0,
      errorDetails: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      errorInfo: error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component', context } = this.props;
    
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent || 'Unknown',
      url: window.location?.href || 'React Native App',
      // In a real app, get these from auth context
      userId: 'unknown',
      sessionId: 'unknown',
    };

    this.setState({ errorDetails });

    // Log to performance monitor
    if (__DEV__) {
      console.error(`[ErrorBoundary] ${level.toUpperCase()} caught:`, error.message, context || 'Unknown');
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Send to analytics/monitoring service
    this.sendErrorToAnalytics(error, errorInfo, errorDetails);

    // Log to performance monitor
    performanceMonitor.updateConfig({ enableLogging: true });
  }

  private sendErrorToAnalytics = (
    error: Error, 
    errorInfo: ErrorInfo, 
    errorDetails: ErrorDetails
  ) => {
    // In a real app, send to crash analytics service (Sentry, Bugsnag, etc.)
    if (__DEV__) {
      console.group('📊 Error Analytics');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.table({
        errorId: this.state.errorId,
        level: this.props.level,
        context: this.props.context,
        retryCount: this.state.retryCount,
        timestamp: errorDetails.timestamp,
      });
      console.groupEnd();
    }

    // Simulate analytics call
    setTimeout(() => {
      if (__DEV__) {
        console.log('📤 Error sent to analytics service');
      }
    }, 100);
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      this.setState({ canRetry: false });
      return;
    }


    this.setState(prevState => ({
      hasError: false,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      errorDetails: null,
    }));

    // Delay retry to prevent immediate re-error
    this.retryTimeoutId = setTimeout(() => {
      // Force a re-render
      this.forceUpdate();
    }, 500);
  };

  handleReload = () => {
    if (window.location?.reload) {
      window.location.reload();
    } else {
      // React Native - could trigger app restart
    }
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent, level = 'component' } = this.props;
      
      if (FallbackComponent && this.state.errorInfo) {
        return <FallbackComponent error={this.state.errorInfo} retry={this.handleRetry} />;
      }

      return (
        <ProfessionalErrorScreen
          error={this.state.errorInfo}
          errorDetails={this.state.errorDetails}
          onRetry={this.state.canRetry ? this.handleRetry : undefined}
          onReload={this.handleReload}
          level={level}
          context={this.props.context}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Professional Error Screen Component
 */
interface ProfessionalErrorScreenProps {
  error: Error | null;
  errorDetails: ErrorDetails | null;
  onRetry?: () => void;
  onReload: () => void;
  level: string;
  context?: string;
  retryCount: number;
  maxRetries: number;
}

const ProfessionalErrorScreen: React.FC<ProfessionalErrorScreenProps> = ({
  error,
  errorDetails,
  onRetry,
  onReload,
  level,
  context,
  retryCount,
  maxRetries,
}) => {
  const theme = useTheme();

  const getErrorSeverity = (): 'low' | 'medium' | 'high' => {
    if (level === 'app') return 'high';
    if (level === 'screen') return 'medium';
    return 'low';
  };

  const getSeverityColor = () => {
    const severity = getErrorSeverity();
    switch (severity) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.tertiary;
      case 'low': return theme.colors.secondary;
      default: return theme.colors.outline;
    }
  };

  const getErrorIcon = () => {
    const severity = getErrorSeverity();
    switch (severity) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert';
      case 'low': return 'information';
      default: return 'help-circle';
    }
  };

  const getUserFriendlyMessage = () => {
    const baseMessage = error?.message || 'An unexpected error occurred';
    
    // Map technical errors to user-friendly messages
    if (baseMessage.includes('Network')) {
      return 'Connection problem. Please check your internet connection.';
    }
    if (baseMessage.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }
    if (baseMessage.includes('Permission')) {
      return 'Permission denied. Please contact support.';
    }
    if (baseMessage.includes('Not found')) {
      return 'The requested resource was not found.';
    }
    
    return 'Something went wrong. Our team has been notified.';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Error Header */}
        <Surface style={[styles.errorHeader, { backgroundColor: theme.colors.errorContainer }]}>
          <Icon source={getErrorIcon()} size={48} color={getSeverityColor()} />
          <Text variant="headlineSmall" style={[styles.errorTitle, { color: theme.colors.onErrorContainer }]}>
            Oops! Something went wrong
          </Text>
        </Surface>

        {/* User-Friendly Message */}
        <Card style={styles.messageCard}>
          <Card.Content>
            <Text variant="bodyLarge" style={[styles.userMessage, { color: theme.colors.onSurface }]}>
              {getUserFriendlyMessage()}
            </Text>
          </Card.Content>
        </Card>

        {/* Error Context */}
        <View style={styles.contextSection}>
          <View style={styles.contextRow}>
            <Chip icon="layers" style={styles.contextChip}>Level: {level}</Chip>
            {context && <Chip icon="map-marker" style={styles.contextChip}>Context: {context}</Chip>}
            <Chip 
              icon="refresh" 
              style={[styles.contextChip, { backgroundColor: getSeverityColor() + '20' }]}
            >
              Attempts: {retryCount}/{maxRetries}
            </Chip>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {onRetry && (
            <Button 
              mode="contained" 
              onPress={onRetry}
              icon="refresh"
              style={styles.actionButton}
              buttonColor={theme.colors.primary}
            >
              Try Again
            </Button>
          )}
          
          <Button 
            mode="outlined" 
            onPress={onReload}
            icon="restart"
            style={styles.actionButton}
            textColor={theme.colors.primary}
          >
            Reload App
          </Button>

          <Button 
            mode="text" 
            onPress={() => {
              // In a real app, navigate to help/support
            }}
            icon="help-circle"
            style={styles.actionButton}
            textColor={theme.colors.secondary}
          >
            Get Help
          </Button>
        </View>

        {/* Technical Details (Dev Mode) */}
        {__DEV__ && error && (
          <>
            <Divider style={styles.divider} />
            <Card style={styles.technicalCard}>
              <Card.Title title="Technical Details" subtitle="(Development Mode)" />
              <Card.Content>
                <Text variant="labelMedium" style={[styles.technicalLabel, { color: theme.colors.outline }]}>
                  Error Message:
                </Text>
                <Text variant="bodySmall" style={[styles.technicalText, { color: theme.colors.error }]}>
                  {error.message}
                </Text>
                
                {errorDetails?.timestamp && (
                  <>
                    <Text variant="labelMedium" style={[styles.technicalLabel, { color: theme.colors.outline }]}>
                      Timestamp:
                    </Text>
                    <Text variant="bodySmall" style={[styles.technicalText, { color: theme.colors.onSurface }]}>
                      {new Date(errorDetails.timestamp).toLocaleString()}
                    </Text>
                  </>
                )}

                {error.stack && (
                  <>
                    <Text variant="labelMedium" style={[styles.technicalLabel, { color: theme.colors.outline }]}>
                      Stack Trace:
                    </Text>
                    <ScrollView style={styles.stackTrace} horizontal>
                      <Text variant="bodySmall" style={[styles.technicalText, { fontFamily: 'monospace' }]}>
                        {error.stack}
                      </Text>
                    </ScrollView>
                  </>
                )}
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  
  // Error Header
  errorHeader: {
    width: '100%',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Message Card
  messageCard: {
    width: '100%',
    marginBottom: 16,
    elevation: 2,
  },
  userMessage: {
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Context Section
  contextSection: {
    width: '100%',
    marginBottom: 20,
  },
  contextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  contextChip: {
    marginHorizontal: 2,
  },
  
  // Actions Section
  actionsSection: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    marginHorizontal: 8,
  },
  
  // Technical Details
  divider: {
    width: '100%',
    marginVertical: 16,
  },
  technicalCard: {
    width: '100%',
    elevation: 1,
  },
  technicalLabel: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  technicalText: {
    marginBottom: 8,
  },
  stackTrace: {
    maxHeight: 150,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});

/**
 * Specialized Error Boundaries for different contexts
 */

// App-level error boundary
export const AppErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProfessionalErrorBoundary 
    level="app" 
    context="Application Root"
    maxRetries={1}
    enableRetry={true}
  >
    {children}
  </ProfessionalErrorBoundary>
);

// Screen-level error boundary
export const ScreenErrorBoundary: React.FC<{ 
  children: ReactNode; 
  screenName: string;
}> = ({ children, screenName }) => (
  <ProfessionalErrorBoundary 
    level="screen" 
    context={screenName}
    maxRetries={3}
    enableRetry={true}
  >
    {children}
  </ProfessionalErrorBoundary>
);

// Component-level error boundary
export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode; 
  componentName?: string;
}> = ({ children, componentName = 'Component' }) => (
  <ProfessionalErrorBoundary 
    level="component" 
    context={componentName}
    maxRetries={5}
    enableRetry={true}
  >
    {children}
  </ProfessionalErrorBoundary>
);

export default ProfessionalErrorBoundary;