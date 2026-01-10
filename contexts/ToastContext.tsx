
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast, ToastProps } from '../components/ui/Toast';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

type ToastOptions = Omit<ToastProps, 'onDismiss'> & {
  action?: ToastAction;
  duration?: number; // milliseconds, 0 = persistent
  persistent?: boolean;
};

type AddToastFunction = (toast: ToastOptions) => void;

interface ToastContextType {
  addToast: AddToastFunction;
  removeToast: (id: number) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastMessage extends ToastOptions {
  id: number;
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = React.useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((toast: ToastOptions) => {
    const id = toastIdRef.current++;
    const duration = toast.duration ?? (toast.persistent ? 0 : 5000);
    
    setToasts(currentToasts => [...currentToasts, { ...toast, id }]);
    
    // Auto-dismiss if not persistent
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
      {children}
      <div
        role="region"
        aria-live="assertive"
        className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-3 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast {...toast} onDismiss={() => removeToast(toast.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};