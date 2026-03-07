/**
 * Professional Performance Analytics Service
 * Enterprise-grade performance tracking and business intelligence
 */

interface PerformanceEvent {
  event: string;
  timestamp: number;
  properties: Record<string, any>;
  context?: {
    screen?: string;
    user_id?: string;
    session_id?: string;
    restaurant_id?: string;
  };
}

interface BusinessMetrics {
  component_render_time: number;
  screen_load_time: number;
  api_response_time: number;
  user_interaction_delay: number;
  memory_usage: number;
  error_count: number;
}

interface UserFlowMetrics {
  screen: string;
  action: string;
  duration: number;
  success: boolean;
  error?: string;
}

class PerformanceAnalyticsService {
  private events: PerformanceEvent[] = [];
  private sessionId: string;
  private startTime: number;
  private screenStartTimes = new Map<string, number>();
  private userFlows: UserFlowMetrics[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializePerformanceObserver();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize performance observer for native performance metrics
   */
  private initializePerformanceObserver(): void {
    // In React Native, we'll manually track performance
    // In a web environment, you could use PerformanceObserver
    console.log('🚀 Performance Analytics Service initialized');
  }

  /**
   * Track component performance
   */
  trackComponentPerformance(
    componentName: string,
    renderTime: number,
    memoryUsage?: number
  ): void {
    this.trackEvent('component_render', {
      component_name: componentName,
      render_time: renderTime,
      memory_usage: memoryUsage,
      is_slow: renderTime > 16, // 60fps threshold
      severity: renderTime > 32 ? 'high' : renderTime > 16 ? 'medium' : 'low',
    });

    // Business intelligence: Track slow components for optimization
    if (renderTime > 50) {
      this.trackBusinessEvent('performance_bottleneck', {
        type: 'component',
        name: componentName,
        impact: 'high',
        render_time: renderTime,
      });
    }
  }

  /**
   * Track screen navigation performance
   */
  trackScreenNavigation(screenName: string, navigationTime: number): void {
    this.trackEvent('screen_navigation', {
      screen_name: screenName,
      navigation_time: navigationTime,
      is_slow: navigationTime > 300, // 300ms threshold
      previous_screen: this.getCurrentScreen(),
    });

    // Business metric: Track slow screen transitions
    if (navigationTime > 1000) {
      this.trackBusinessEvent('slow_navigation', {
        screen: screenName,
        duration: navigationTime,
        impact: 'user_experience',
      });
    }
  }

  /**
   * Track API performance
   */
  trackAPIPerformance(
    endpoint: string,
    method: string,
    duration: number,
    success: boolean,
    statusCode?: number
  ): void {
    this.trackEvent('api_call', {
      endpoint,
      method,
      duration,
      success,
      status_code: statusCode,
      is_slow: duration > 2000, // 2 second threshold
    });

    // Business intelligence: Track API bottlenecks
    if (!success || duration > 5000) {
      this.trackBusinessEvent('api_performance_issue', {
        endpoint,
        method,
        duration,
        success,
        impact: 'business_operations',
      });
    }
  }

  /**
   * Track user interaction performance
   */
  trackUserInteraction(
    action: string,
    element: string,
    responseTime: number
  ): void {
    this.trackEvent('user_interaction', {
      action,
      element,
      response_time: responseTime,
      is_delayed: responseTime > 100, // 100ms threshold for UI responsiveness
    });

    // Business metric: Track UI responsiveness issues
    if (responseTime > 500) {
      this.trackBusinessEvent('ui_responsiveness_issue', {
        action,
        element,
        response_time: responseTime,
        impact: 'user_satisfaction',
      });
    }
  }

  /**
   * Track memory usage patterns
   */
  trackMemoryUsage(component: string, usage: number): void {
    const usageMB = usage / (1024 * 1024);
    
    this.trackEvent('memory_usage', {
      component,
      usage_bytes: usage,
      usage_mb: Math.round(usageMB),
      is_high: usageMB > 150, // 150MB threshold
    });

    // Business intelligence: Track memory issues
    if (usageMB > 200) {
      this.trackBusinessEvent('memory_warning', {
        component,
        usage_mb: Math.round(usageMB),
        impact: 'app_stability',
      });
    }
  }

  /**
   * Track user flow completion
   */
  trackUserFlow(
    flowName: string,
    steps: string[],
    duration: number,
    success: boolean,
    abandonedAt?: string
  ): void {
    const flow: UserFlowMetrics = {
      screen: flowName,
      action: 'complete_flow',
      duration,
      success,
    };

    if (!success && abandonedAt) {
      flow.error = `Abandoned at: ${abandonedAt}`;
    }

    this.userFlows.push(flow);

    this.trackEvent('user_flow', {
      flow_name: flowName,
      steps,
      duration,
      success,
      abandoned_at: abandonedAt,
      conversion_rate: success ? 1 : 0,
    });

    // Business intelligence: Track flow abandonment
    if (!success) {
      this.trackBusinessEvent('flow_abandonment', {
        flow: flowName,
        abandoned_step: abandonedAt,
        completion_rate: this.calculateFlowCompletionRate(flowName),
        impact: 'conversion',
      });
    }
  }

  /**
   * Track business-specific events
   */
  trackBusinessEvent(event: string, properties: Record<string, any>): void {
    this.trackEvent(`business_${event}`, {
      ...properties,
      business_impact: true,
      priority: properties.impact === 'revenue' ? 'high' : 'medium',
    });
  }

  /**
   * Generic event tracking
   */
  private trackEvent(
    event: string,
    properties: Record<string, any>,
    context?: any
  ): void {
    const performanceEvent: PerformanceEvent = {
      event,
      timestamp: Date.now(),
      properties: {
        ...properties,
        session_id: this.sessionId,
        session_duration: Date.now() - this.startTime,
      },
      context: {
        screen: this.getCurrentScreen(),
        user_id: this.getCurrentUserId(),
        session_id: this.sessionId,
        restaurant_id: this.getCurrentRestaurantId(),
        ...context,
      },
    };

    this.events.push(performanceEvent);

    // Analytics logging disabled — was causing JS thread blocking via bridge overhead

    // Batch send events when buffer is full
    if (this.events.length >= 50) {
      this.flushEvents();
    }
  }

  /**
   * Get current screen name (would integrate with navigation)
   */
  private getCurrentScreen(): string {
    // In a real app, get this from navigation state
    return 'unknown';
  }

  /**
   * Get current user ID (would integrate with auth)
   */
  private getCurrentUserId(): string {
    // In a real app, get this from auth context
    return 'unknown';
  }

  /**
   * Get current restaurant ID (would integrate with context)
   */
  private getCurrentRestaurantId(): string {
    // In a real app, get this from restaurant context
    return 'unknown';
  }

  /**
   * Calculate flow completion rate
   */
  private calculateFlowCompletionRate(flowName: string): number {
    const flowEvents = this.userFlows.filter(f => f.screen === flowName);
    if (flowEvents.length === 0) return 0;

    const successful = flowEvents.filter(f => f.success).length;
    return successful / flowEvents.length;
  }

  /**
   * Get performance summary for monitoring dashboard
   */
  getPerformanceSummary(): {
    session_id: string;
    session_duration: number;
    total_events: number;
    performance_issues: number;
    business_metrics: BusinessMetrics;
    top_slow_components: string[];
    error_rate: number;
  } {
    const sessionDuration = Date.now() - this.startTime;
    const performanceEvents = this.events.filter(e => 
      e.event.includes('component_render') || 
      e.event.includes('api_call') || 
      e.event.includes('screen_navigation')
    );

    const slowComponents = this.events
      .filter(e => e.event === 'component_render' && e.properties.is_slow)
      .map(e => e.properties.component_name)
      .reduce((acc: Record<string, number>, component: string) => {
        acc[component] = (acc[component] || 0) + 1;
        return acc;
      }, {});

    const topSlowComponents = Object.entries(slowComponents)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([component]) => component);

    const errorEvents = this.events.filter(e => 
      e.properties.success === false || 
      e.properties.error
    );

    // Calculate average metrics
    const componentRenders = this.events.filter(e => e.event === 'component_render');
    const avgRenderTime = componentRenders.length > 0 
      ? componentRenders.reduce((sum, e) => sum + e.properties.render_time, 0) / componentRenders.length
      : 0;

    const apiCalls = this.events.filter(e => e.event === 'api_call');
    const avgApiTime = apiCalls.length > 0
      ? apiCalls.reduce((sum, e) => sum + e.properties.duration, 0) / apiCalls.length
      : 0;

    const memoryEvents = this.events.filter(e => e.event === 'memory_usage');
    const avgMemoryUsage = memoryEvents.length > 0
      ? memoryEvents.reduce((sum, e) => sum + e.properties.usage_mb, 0) / memoryEvents.length
      : 0;

    return {
      session_id: this.sessionId,
      session_duration: sessionDuration,
      total_events: this.events.length,
      performance_issues: performanceEvents.filter(e => 
        e.properties.is_slow || e.properties.is_delayed
      ).length,
      business_metrics: {
        component_render_time: avgRenderTime,
        screen_load_time: 0, // Would calculate from navigation events
        api_response_time: avgApiTime,
        user_interaction_delay: 0, // Would calculate from interaction events
        memory_usage: avgMemoryUsage,
        error_count: errorEvents.length,
      },
      top_slow_components: topSlowComponents,
      error_rate: this.events.length > 0 ? errorEvents.length / this.events.length : 0,
    };
  }

  /**
   * Flush events to analytics service
   */
  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = []; // Clear buffer

    try {
      // In a real app, send to analytics service (Mixpanel, Amplitude, etc.)

      // Simulate API call
      // await analyticsAPI.sendEvents(eventsToSend);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      
      // Re-add events to buffer for retry
      this.events.unshift(...eventsToSend);
    }
  }

  /**
   * Manual flush for app shutdown or background
   */
  async flush(): Promise<void> {
    await this.flushEvents();
  }

  /**
   * Get real-time metrics for debugging
   */
  getRealTimeMetrics(): {
    current_session: string;
    events_count: number;
    recent_events: PerformanceEvent[];
    performance_status: 'good' | 'warning' | 'critical';
  } {
    const recentEvents = this.events.slice(-10);
    const recentSlowEvents = recentEvents.filter(e => 
      e.properties.is_slow || e.properties.is_delayed
    );

    let status: 'good' | 'warning' | 'critical' = 'good';
    if (recentSlowEvents.length > 5) {
      status = 'critical';
    } else if (recentSlowEvents.length > 2) {
      status = 'warning';
    }

    return {
      current_session: this.sessionId,
      events_count: this.events.length,
      recent_events: recentEvents,
      performance_status: status,
    };
  }
}

// Singleton instance
export const performanceAnalytics = new PerformanceAnalyticsService();

export default PerformanceAnalyticsService;