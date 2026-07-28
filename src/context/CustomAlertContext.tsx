import React, { createContext, useContext, useState, useCallback } from 'react';
import { CustomAlertModal, AlertType } from '../components/ui/CustomAlertModal';

export interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface CustomAlertContextType {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const CustomAlertContext = createContext<CustomAlertContextType | undefined>(undefined);

export const CustomAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertOptions & { isConfirm?: boolean }>({
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertConfig({
      ...options,
      type: options.type || 'info',
      isConfirm: false,
    });
    setVisible(true);
  }, []);

  const showConfirm = useCallback((options: AlertOptions) => {
    setAlertConfig({
      ...options,
      type: options.type || 'warning',
      isConfirm: true,
    });
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    hideAlert();
    if (alertConfig.onConfirm) {
      await alertConfig.onConfirm();
    }
  }, [alertConfig, hideAlert]);

  const handleCancel = useCallback(() => {
    hideAlert();
    if (alertConfig.onCancel) {
      alertConfig.onCancel();
    }
  }, [alertConfig, hideAlert]);

  return (
    <CustomAlertContext.Provider value={{ showAlert, showConfirm, hideAlert }}>
      {children}
      <CustomAlertModal
        visible={visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type || 'info'}
        isConfirm={alertConfig.isConfirm}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </CustomAlertContext.Provider>
  );
};

export const useAlert = (): CustomAlertContextType => {
  const context = useContext(CustomAlertContext);
  if (!context) {
    throw new Error('useAlert must be used within a CustomAlertProvider');
  }
  return context;
};
 // Alert queue dispatch
