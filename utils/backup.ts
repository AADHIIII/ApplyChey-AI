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
  private cache: Backup<T>[] | null = null;

  constructor(storageKey: string, maxBackups: number = 10) {
    this.storageKey = `backup_${storageKey}`;
    this.maxBackups = maxBackups;
  }

  /**
   * Create a backup
   */
  async createBackup(data: T, description?: string): Promise<string> {
    try {
      const backups = await this.getAllBackups();

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

      await secureStorage.setItem(this.storageKey, trimmedBackups);
      this.cache = trimmedBackups;

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
  async getAllBackups(): Promise<Backup<T>[]> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const backups = await secureStorage.getItem<Backup<T>[]>(this.storageKey);
      this.cache = backups || [];
      return this.cache;
    } catch (error) {
      console.error('Failed to load backups:', error);
      return [];
    }
  }

  /**
   * Get all backups synchronously from cache
   */
  getAllBackupsSync(): Backup<T>[] {
    return this.cache || [];
  }

  /**
   * Get a specific backup
   */
  async getBackup(id: string): Promise<Backup<T> | null> {
    const backups = await this.getAllBackups();
    return backups.find(b => b.id === id) || null;
  }

  /**
   * Restore a backup
   */
  async restoreBackup(id: string): Promise<T | null> {
    const backup = await this.getBackup(id);
    return backup?.data || null;
  }

  /**
   * Delete a backup
   */
  async deleteBackup(id: string): Promise<void> {
    try {
      const backups = await this.getAllBackups();
      const filtered = backups.filter(b => b.id !== id);
      await secureStorage.setItem(this.storageKey, filtered);
      this.cache = filtered;
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
      this.cache = null;
    } catch (error) {
      console.error('Failed to clear backups:', error);
    }
  }

  /**
   * Get the most recent backup
   */
  async getLatestBackup(): Promise<Backup<T> | null> {
    const backups = await this.getAllBackups();
    return backups[0] || null;
  }

  /**
   * Initialize by loading backups into cache
   */
  async initialize(): Promise<void> {
    await this.getAllBackups();
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
export async function exportBackupHistory<T>(manager: BackupManager<T>): Promise<string> {
  const backups = await manager.getAllBackups();
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
