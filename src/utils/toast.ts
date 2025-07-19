import Toast from 'react-native-toast-message';

export interface ToastConfig {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export const showToast = ({
  type,
  title,
  message,
  duration = 4000,
}: ToastConfig): void => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: duration,
    position: 'top',
    topOffset: 60,
  });
};

export const showSuccessToast = (title: string, message: string): void => {
  showToast({ type: 'success', title, message });
};

export const showErrorToast = (title: string, message: string): void => {
  showToast({ type: 'error', title, message });
};

export const showInfoToast = (title: string, message: string): void => {
  showToast({ type: 'info', title, message });
};

export const showWarningToast = (title: string, message: string): void => {
  showToast({ type: 'warning', title, message });
};

export const hideToast = (): void => {
  Toast.hide();
};