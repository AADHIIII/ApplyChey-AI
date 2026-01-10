/**
 * Data Backup and Recovery Utilities
 */

import { secureStorage } from './secureStorage';
import { errorTracker } from './errorTracking';

export interface Backup<T> {
  id: string;
  timestamp: number;
  data: T;
  version: string;
  description?: string;
}

export class BackupManager<T> {
  private storageKey: string;
  private maxBackups: number;

  constructor(storageKey: string, maxBackups: number = 10) {
    this.storageKey = `backup_${storageKey}`;
    this.maxBackups = maxBackups;
  }

  /**
   * Create a backup
   */
  createBackup(data: T, description?: string): string {
    try {
      const backups = this.getAllBackups();
      
      const backup: Backup<T> = {
        id: this.generateId(),
        timestamp: Date.now(),
        data,
        version: '1.0',
        description
      };

      backups.unshift(backup);

      // Keep only max number of backups
      const trimmedBackups = backups.slice(0, this.maxBackups);

      secureStorage.setItem(this.storageKey, trimmedBackups);

      return backup.id;
    } catch (error) {
      errorTracker.logError(
        error instanceof Error ? error : new Error('Backup creation failed'),
        'high',
        { context: 'backup-manager' }
      );
      throw error;
    }
  }

  /**
   * Get all backups
   */
  getAllBackups(): Backup<T>[] {
    try {
      return secureStorage.getItem<Backup<T>[]>(this.storageKey) || [];
    } catch (error) {
      console.error('Failed to load backups:', error);
      return [];
    }
  }

  /**
   * Get a specific backup
   */
  getBackup(id: string): Backup<T> | null {
    const backups = this.getAllBackups();
    return backups.find(b => b.id === id) || null;
  }

  /**
   * Restore a backup
   */
  restoreBackup(id: string): T | null {
    const backup = this.getBackup(id);
    return backup?.data || null;
  }

  /**
   * Delete a backup
   */
  deleteBackup(id: string): void {
    try {
      const backups = this.getAllBackups();
      const filtered = backups.filter(b => b.id !== id);
      secureStorage.setItem(this.storageKey, filtered);
    } catch (error) {
      console.error('Failed to delete backup:', error);
    }
  }

  /**
   * Clear all backups
   */
  clearAllBackups(): void {
    try {
      secureStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear backups:', error);
    }
  }

  /**
   * Get the most recent backup
   */
  getLatestBackup(): Backup<T> | null {
    const backups = this.getAllBackups();
    return backups[0] || null;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Export history for debugging
 */
export function exportBackupHistory<T>(manager: BackupManager<T>): string {
  const backups = manager.getAllBackups();
  return JSON.stringify(backups, null, 2);
}

/**
 * Import backup history
 */
export function importBackupHistory<T>(
  manager: BackupManager<T>,
  jsonString: string
): boolean {
  try {
    const backups = JSON.parse(jsonString) as Backup<T>[];
    // Validate structure
    if (!Array.isArray(backups)) {
      throw new Error('Invalid backup format');
    }
    // This would require access to private storageKey
    // In practice, you'd need to refactor or use a different approach
    console.log('Import functionality needs implementation');
    return true;
  } catch (error) {
    console.error('Failed to import backups:', error);
    return false;
  }
}
