/**
 * Secure Storage Utility
 * Provides AES-GCM encrypted storage for sensitive data in browser
 * Uses Web Crypto API for real encryption (not just encoding)
 */

/**
 * Cryptographic utilities using Web Crypto API
 */
class CryptoHelper {
  private static keyPromise: Promise<CryptoKey> | null = null;
  private static readonly KEY_STORAGE = 'applychey_key_material';
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;

  /**
   * Generate a new encryption key
   */
  private static async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      true, // extractable for storage
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export key to storable format
   */
  private static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    const bytes = new Uint8Array(exported);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Import key from stored format
   */
  private static async importKey(keyHex: string): Promise<CryptoKey> {
    const bytes = new Uint8Array(keyHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    return crypto.subtle.importKey(
      'raw',
      bytes,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get or create the encryption key
   * Key is stored in sessionStorage for persistence during session
   */
  static async getKey(): Promise<CryptoKey> {
    if (this.keyPromise) {
      return this.keyPromise;
    }

    this.keyPromise = (async () => {
      // Try to load existing key from session
      const storedKey = sessionStorage.getItem(this.KEY_STORAGE);
      if (storedKey) {
        try {
          return await this.importKey(storedKey);
        } catch {
          // Key corrupted, generate new one
        }
      }

      // Generate new key and store it
      const key = await this.generateKey();
      const exported = await this.exportKey(key);
      sessionStorage.setItem(this.KEY_STORAGE, exported);
      return key;
    })();

    return this.keyPromise;
  }

  /**
   * Encrypt data using AES-GCM
   */
  static async encrypt(plaintext: string): Promise<string> {
    const key = await this.getKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random IV (12 bytes for AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv },
      key,
      data
    );

    // Combine IV + ciphertext and encode as hex
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return Array.from(combined).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Decrypt data using AES-GCM
   */
  static async decrypt(ciphertext: string): Promise<string> {
    const key = await this.getKey();

    // Decode hex to bytes
    const combined = new Uint8Array(ciphertext.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));

    // Extract IV (first 12 bytes) and ciphertext
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}

/**
 * Secure Storage with AES-GCM encryption
 */
class SecureStorage {
  private storagePrefix = 'applychey_secure_';
  private cache: Map<string, any> = new Map();

  /**
   * Set item in secure storage with encryption
   */
  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encrypted = await CryptoHelper.encrypt(stringValue);
      localStorage.setItem(this.storagePrefix + key, encrypted);
      this.cache.set(key, value);
    } catch (error) {
      console.error('Failed to save to secure storage:', error);
    }
  }

  /**
   * Get item from secure storage with decryption
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    try {
      const encrypted = localStorage.getItem(this.storagePrefix + key);
      if (!encrypted) return null;

      const decrypted = await CryptoHelper.decrypt(encrypted);
      if (!decrypted) return null;

      let value: T;
      try {
        value = JSON.parse(decrypted) as T;
      } catch {
        value = decrypted as T;
      }

      this.cache.set(key, value);
      return value;
    } catch (error) {
      console.error('Failed to read from secure storage:', error);
      // If decryption fails (e.g., different session key), remove corrupted data
      localStorage.removeItem(this.storagePrefix + key);
      return null;
    }
  }

  /**
   * Synchronous get for backward compatibility
   * Returns cached value or null (use async getItem for guaranteed results)
   */
  getItemSync<T = any>(key: string): T | null {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }
    return null;
  }

  /**
   * Remove item from secure storage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.storagePrefix + key);
      this.cache.delete(key);
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
      this.cache.clear();
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

  /**
   * Initialize storage by preloading cached values
   */
  async initialize(): Promise<void> {
    const keys = this.getAllKeys();
    for (const key of keys) {
      await this.getItem(key);
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Export class for custom instances
export { SecureStorage };

/**
 * Session Storage variant with encryption
 */
class SecureSessionStorage {
  private storagePrefix = 'applychey_session_';
  private cache: Map<string, any> = new Map();

  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encrypted = await CryptoHelper.encrypt(stringValue);
      sessionStorage.setItem(this.storagePrefix + key, encrypted);
      this.cache.set(key, value);
    } catch (error) {
      console.error('Failed to save to session storage:', error);
    }
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    try {
      const encrypted = sessionStorage.getItem(this.storagePrefix + key);
      if (!encrypted) return null;

      const decrypted = await CryptoHelper.decrypt(encrypted);
      if (!decrypted) return null;

      let value: T;
      try {
        value = JSON.parse(decrypted) as T;
      } catch {
        value = decrypted as T;
      }

      this.cache.set(key, value);
      return value;
    } catch (error) {
      console.error('Failed to read from session storage:', error);
      sessionStorage.removeItem(this.storagePrefix + key);
      return null;
    }
  }

  getItemSync<T = any>(key: string): T | null {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }
    return null;
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(this.storagePrefix + key);
      this.cache.delete(key);
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
      this.cache.clear();
    } catch (error) {
      console.error('Failed to clear session storage:', error);
    }
  }
}

export const secureSessionStorage = new SecureSessionStorage();
