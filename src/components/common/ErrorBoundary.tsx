/**
 * Error Boundary - Professional error handling for dashboard components
 * Under 200 lines, focused on error recovery and user experience
 */

import React, { Component, ReactNode } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface Props {
  children: ReactNode;
  fallback?: string | ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    if (__DEV__) { console.error('ErrorBoundary caught an error:', error.message); }
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'string') {
        return this.renderDefaultError(this.props.fallback);
      }
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return this.renderDefaultError('Something went wrong');
    }

    return this.props.children;
  }

  private renderDefaultError(message: string) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="error-outline" size={48} color="#dc3545" />
        <Text style={styles.title}>Oops! {message}</Text>
        <Text style={styles.message}>
          We encountered an unexpected error. Please try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
          <MaterialIcons name="refresh" size={20} color="white" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        {__DEV__ && this.state.error && (
          <Text style={styles.errorDetails}>
            {this.state.error.message}
          </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#f8f9fa',
  },
  title: {
    ...typography.headlineSmall,
    fontWeight: '700',
    color: '#1A1D21',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyLarge,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryText: {
    ...typography.bodyLarge,
    color: 'white',
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  errorDetails: {
    ...typography.bodySmall,
    color: '#dc3545',
    marginTop: spacing.xl,
    textAlign: 'center',
    fontSize: 12,
  },
});