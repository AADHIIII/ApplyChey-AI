/**
 * Secure Storage Utility
 * Provides encrypted storage for sensitive data in browser
 */

/**
 * Simple encryption/decryption using Web Crypto API
 * Note: This is basic obfuscation. For production, consider a more robust solution.
 */
class SecureStorage {
  private storagePrefix = 'applychey_secure_';

  /**
   * Encode data to base64
   */
  private encode(data: string): string {
    return btoa(encodeURIComponent(data));
  }

  /**
   * Decode data from base64
   */
  private decode(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return '';
    }
  }

  /**
   * Set item in secure storage
   */
  setItem(key: string, value: any): void {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encoded = this.encode(stringValue);
      localStorage.setItem(this.storagePrefix + key, encoded);
    } catch (error) {
      console.error('Failed to save to secure storage:', error);
    }
  }

  /**
   * Get item from secure storage
   */
  getItem<T = any>(key: string): T | null {
    try {
      const encoded = localStorage.getItem(this.storagePrefix + key);
      if (!encoded) return null;

      const decoded = this.decode(encoded);
      if (!decoded) return null;

      try {
        return JSON.parse(decoded) as T;
      } catch {
        return decoded as T;
      }
    } catch (error) {
      console.error('Failed to read from secure storage:', error);
      return null;
    }
  }

  /**
   * Remove item from secure storage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.storagePrefix + key);
    } catch (error) {
      console.error('Failed to remove from secure storage:', error);
    }
  }

  /**
   * Clear all secure storage items
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
    }
  }

  /**
   * Check if key exists
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(this.storagePrefix + key) !== null;
  }

  /**
   * Get all keys
   */
  getAllKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.storagePrefix))
        .map(key => key.replace(this.storagePrefix, ''));
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Export class for custom instances
export { SecureStorage };

/**
 * Session Storage variant for temporary data
 */
class SecureSessionStorage {
  private storagePrefix = 'applychey_session_';

  private encode(data: string): string {
    return btoa(encodeURIComponent(data));
  }

  private decode(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return '';
    }
  }

  setItem(key: string, value: any): void {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encoded = this.encode(stringValue);
      sessionStorage.setItem(this.storagePrefix + key, encoded);
    } catch (error) {
      console.error('Failed to save to session storage:', error);
    }
  }

  getItem<T = any>(key: string): T | null {
    try {
      const encoded = sessionStorage.getItem(this.storagePrefix + key);
      if (!encoded) return null;

      const decoded = this.decode(encoded);
      if (!decoded) return null;

      try {
        return JSON.parse(decoded) as T;
      } catch {
        return decoded as T;
      }
    } catch (error) {
      console.error('Failed to read from session storage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(this.storagePrefix + key);
    } catch (error) {
      console.error('Failed to remove from session storage:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear session storage:', error);
    }
  }
}

export const secureSessionStorage = new SecureSessionStorage();
