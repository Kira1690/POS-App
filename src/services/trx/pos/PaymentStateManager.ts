import { IPaymentStateManager, PaymentState } from '../interfaces/IPaymentProcessor';
import { LoggerFactory } from '../logging/LoggingService';

// Single Responsibility Principle - Only handles payment state management
export class PaymentStateManager implements IPaymentStateManager {
  private currentState: PaymentState = PaymentState.IDLE;
  private stateChangeCallbacks: Array<(state: PaymentState) => void> = [];
  private logger = LoggerFactory.createLogger('PaymentStateManager');

  // Valid state transitions
  private readonly VALID_TRANSITIONS: Map<PaymentState, PaymentState[]> = new Map([
    [PaymentState.IDLE, [PaymentState.PROCESSING]],
    [PaymentState.PROCESSING, [PaymentState.SUCCESS, PaymentState.FAILED, PaymentState.CANCELLED]],
    [PaymentState.SUCCESS, [PaymentState.IDLE]],
    [PaymentState.FAILED, [PaymentState.IDLE, PaymentState.PROCESSING]],
    [PaymentState.CANCELLED, [PaymentState.IDLE]]
  ]);

  getCurrentState(): PaymentState {
    return this.currentState;
  }

  transitionTo(newState: PaymentState): void {
    if (!this.canTransition(this.currentState, newState)) {
      throw new Error(`Invalid state transition from ${this.currentState} to ${newState}`);
    }
    const previousState = this.currentState;
    this.currentState = newState;
    this.notifyStateChange(newState, previousState);
  }

  canTransition(fromState: PaymentState, toState: PaymentState): boolean {
    const validTransitions = this.VALID_TRANSITIONS.get(fromState);
    return validTransitions ? validTransitions.includes(toState) : false;
  }

  onStateChange(callback: (state: PaymentState) => void): () => void {
    this.stateChangeCallbacks.push(callback);
    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index > -1) this.stateChangeCallbacks.splice(index, 1);
    };
  }

  isIdle(): boolean { return this.currentState === PaymentState.IDLE; }
  isProcessing(): boolean { return this.currentState === PaymentState.PROCESSING; }

  isComplete(): boolean {
    return this.currentState === PaymentState.SUCCESS ||
           this.currentState === PaymentState.FAILED ||
           this.currentState === PaymentState.CANCELLED;
  }

  reset(): void {
    if (this.canTransition(this.currentState, PaymentState.IDLE)) {
      this.transitionTo(PaymentState.IDLE);
    }
  }

  forceReset(): void {
    const previousState = this.currentState;
    this.currentState = PaymentState.IDLE;
    this.notifyStateChange(PaymentState.IDLE, previousState);
  }

  getStateHistory(): PaymentState[] {
    return [this.currentState];
  }

  getValidNextStates(): PaymentState[] {
    return this.VALID_TRANSITIONS.get(this.currentState) || [];
  }

  private notifyStateChange(newState: PaymentState, previousState: PaymentState): void {
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        this.logger.error('Error in state change callback', error instanceof Error ? error : new Error(String(error)), undefined, {
          newState,
          previousState
        });
      }
    });
  }

  static createWithCustomTransitions(transitions: Map<PaymentState, PaymentState[]>): PaymentStateManager {
    const manager = new PaymentStateManager();
    (manager as unknown as { VALID_TRANSITIONS: Map<PaymentState, PaymentState[]> }).VALID_TRANSITIONS = transitions;
    return manager;
  }
}
