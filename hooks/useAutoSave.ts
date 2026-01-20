/**
 * Auto-Save Hook with Conflict Resolution
 * Handles debounced saving with offline support and conflict resolution
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { errorTracker } from '../utils/errorTracking';
import { secureStorage } from '../utils/secureStorage';
import { withFirestoreRetry } from '../utils/retry';

export interface AutoSaveOptions<T> {
  data: T;
  save: (data: T) => Promise<void>;
  delay?: number;
  localStorageKey?: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  enabled?: boolean;
}

export interface AutoSaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  hasPendingChanges: boolean;
}

export function useAutoSave<T>(options: AutoSaveOptions<T>): AutoSaveStatus {
  const {
    data,
    save,
    delay = 2000,
    localStorageKey,
    onError,
    onSuccess,
    enabled = true
  } = options;

  const [status, setStatus] = useState<AutoSaveStatus>({
    isSaving: false,
    lastSaved: null,
    error: null,
    hasPendingChanges: false
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<T | null>(null);
  const isFirstRender = useRef(true);

  // Save to localStorage as backup
  const saveToLocalStorage = useCallback((data: T) => {
    if (localStorageKey) {
      try {
        secureStorage.setItem(localStorageKey, {
          data,
          timestamp: Date.now(),
          version: '1.0'
        });
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }, [localStorageKey]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback((): T | null => {
    if (localStorageKey) {
      try {
        const stored = secureStorage.getItem<{ data: T; timestamp: number; version: string }>(localStorageKey);
        return stored?.data || null;
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
      }
    }
    return null;
  }, [localStorageKey]);

  // Main save function
  const performSave = useCallback(async (dataToSave: T) => {
    if (!enabled) return;

    setStatus(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      // Save to remote with retry logic
      await withFirestoreRetry(() => save(dataToSave));

      // Update status
      setStatus(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        error: null,
        hasPendingChanges: false
      }));

      lastSavedDataRef.current = dataToSave;

      // Clear localStorage backup after successful save
      if (localStorageKey) {
        secureStorage.removeItem(localStorageKey);
      }

      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Save failed');
      
      // Log error
      errorTracker.logError(err, 'high', { context: 'auto-save' });

      // Keep data in localStorage as backup
      saveToLocalStorage(dataToSave);

      // Update status
      setStatus(prev => ({
        ...prev,
        isSaving: false,
        error: err,
        hasPendingChanges: true
      }));

      onError?.(err);
    }
  }, [enabled, save, localStorageKey, onError, onSuccess, saveToLocalStorage]);

  // Track pending changes with ref to avoid sync setState in effect
  const hasPendingChangesRef = useRef(false);

  // Auto-save effect
  useEffect(() => {
    // Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Mark as having pending changes using ref first, then update state in timeout
    hasPendingChangesRef.current = true;
    const pendingTimer = setTimeout(() => {
      setStatus(prev => ({ ...prev, hasPendingChanges: true }));
    }, 0);

    // Set new timeout for save
    timeoutRef.current = setTimeout(() => {
      performSave(data);
    }, delay);

    return () => {
      clearTimeout(pendingTimer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, performSave]);

  // Try to recover from localStorage on mount
  useEffect(() => {
    const backup = loadFromLocalStorage();
    if (backup) {
      console.log('Found unsaved changes in localStorage');
      // You might want to prompt the user here
      // For now, we'll just keep the backup available
    }
  }, [loadFromLocalStorage]);

  return status;
}
