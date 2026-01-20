import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface NetworkStatusIndicatorProps {
  position?: 'top' | 'bottom';
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  position = 'top'
}) => {
  const networkStatus = useNetworkStatus();
  const [showOffline, setShowOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOfflineRef = React.useRef(false);

  useEffect(() => {
    // Handle offline state changes in a timeout to avoid sync setState in effect
    const timer = setTimeout(() => {
      if (!networkStatus.isOnline) {
        setShowOffline(true);
        wasOfflineRef.current = true;
        setShowReconnected(false);
      } else if (wasOfflineRef.current && networkStatus.isOnline) {
        setShowOffline(false);
        setShowReconnected(true);
        wasOfflineRef.current = false;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [networkStatus.isOnline]);

  // Auto-hide reconnected message after 3 seconds
  useEffect(() => {
    if (showReconnected) {
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showReconnected]);

  if (!showOffline && !showReconnected) return null;

  const positionClasses = position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <div
      className={`fixed left-0 right-0 ${positionClasses} z-50 animate-in slide-in-from-top duration-300`}
      data-testid="network-status-indicator"
    >
      {showOffline && (
        <div className="bg-red-500 text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
            <span className="font-medium">You are offline</span>
            <span className="text-red-100 text-sm ml-2">
              Changes will be saved locally and synced when connection is restored
            </span>
          </div>
        </div>
      )}

      {showReconnected && (
        <div className="bg-green-500 text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">Back online!</span>
            <span className="text-green-100 text-sm ml-2">
              Syncing your changes...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Connection quality indicator
 */
export const ConnectionQualityBadge: React.FC = () => {
  const networkStatus = useNetworkStatus();

  if (!networkStatus.isOnline) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
        <span className="w-2 h-2 bg-red-500 rounded-full" />
        Offline
      </div>
    );
  }

  const quality = networkStatus.effectiveType;
  let color = 'green';
  let label = 'Good';

  if (quality === 'slow-2g' || quality === '2g') {
    color = 'red';
    label = 'Poor';
  } else if (quality === '3g') {
    color = 'yellow';
    label = 'Fair';
  } else if (quality === '4g') {
    color = 'green';
    label = 'Good';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-${color}-100 text-${color}-700 rounded-full text-xs font-medium`}>
      <span className={`w-2 h-2 bg-${color}-500 rounded-full animate-pulse`} />
      {label}
    </div>
  );
};
