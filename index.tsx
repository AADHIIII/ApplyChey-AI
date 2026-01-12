
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingStates';

// Initialize performance monitoring
import { performanceMonitor } from './utils/performance';

// Import security tests in development
if (import.meta.env.DEV) {
  import('./utils/securityTests').then(() => {
    console.log('🔐 Security testing utilities loaded');
    console.log('   Run window.securityTests.runAll() to test security features');
  });
}

// Send performance metrics after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const summary = performanceMonitor.getSummary();
      console.log('📊 Performance Score:', summary.score + '%');
      
      // Send to analytics in production
      if (!import.meta.env.DEV) {
        performanceMonitor.sendToAnalytics();
      }
    }, 3000);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <React.Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-secondary/50">
            <LoadingSpinner size="xl" text="Loading ApplyChey..." />
          </div>
        }>
          <App />
        </React.Suspense>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);