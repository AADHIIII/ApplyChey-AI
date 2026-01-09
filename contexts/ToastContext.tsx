
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast, ToastProps } from '../components/ui/Toast';

type ToastOptions = Omit<ToastProps, 'onDismiss'>;
type AddToastFunction = (toast: ToastOptions) => void;

interface ToastContextType {
  addToast: AddToastFunction;
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

  const addToast = useCallback((toast: ToastOptions) => {
    const id = toastIdRef.current++;
    setToasts(currentToasts => [...currentToasts, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        role="region"
        aria-live="assertive"
        className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-3"
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
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