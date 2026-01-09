
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';

// Import security tests in development
if (import.meta.env.DEV) {
  import('./utils/securityTests').then(() => {
    console.log('🔐 Security testing utilities loaded');
    console.log('   Run window.securityTests.runAll() to test security features');
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);