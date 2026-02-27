/**
 * TRXSettingsEventEmitter - Observer pattern for TRX settings changes
 */

type SettingsChangeCallback = (event: { key: string; value: unknown }) => void;

export class TRXSettingsEventEmitter {
  private static instance: TRXSettingsEventEmitter;
  private listeners: SettingsChangeCallback[] = [];

  private constructor() {}

  public static getInstance(): TRXSettingsEventEmitter {
    if (!TRXSettingsEventEmitter.instance) {
      TRXSettingsEventEmitter.instance = new TRXSettingsEventEmitter();
    }
    return TRXSettingsEventEmitter.instance;
  }

  emitSettingsChange(event: { key: string; value: unknown }): void {
    this.listeners.forEach(listener => listener(event));
  }

  onSettingsChange(callback: SettingsChangeCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
}
