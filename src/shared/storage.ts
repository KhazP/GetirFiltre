import { UserSettings, DEFAULT_SETTINGS } from './types';
import { STORAGE_KEYS } from './constants';

/**
 * Storage wrapper with sync primary, local fallback
 */
class StorageService {
    private useLocalFallback = false;

    /**
     * Get settings from storage
     */
    async getSettings(): Promise<UserSettings> {
        try {
            const result = await this.get(STORAGE_KEYS.SETTINGS);
            if (result) {
                return { ...DEFAULT_SETTINGS, ...result };
            }
            return { ...DEFAULT_SETTINGS };
        } catch (error) {
            console.error('[GetirFiltre] Storage read error:', error);
            return { ...DEFAULT_SETTINGS };
        }
    }

    /**
     * Save settings to storage
     */
    async saveSettings(settings: UserSettings): Promise<boolean> {
        try {
            await this.set(STORAGE_KEYS.SETTINGS, settings);
            return true;
        } catch (error) {
            console.error('[GetirFiltre] Storage write error:', error);
            return false;
        }
    }

    /**
     * Add a restaurant to blocklist
     */
    async blockRestaurant(slug: string): Promise<boolean> {
        const settings = await this.getSettings();
        if (!settings.blockedRestaurants.includes(slug)) {
            settings.blockedRestaurants.push(slug);
            return this.saveSettings(settings);
        }
        return true;
    }

    /**
     * Remove a restaurant from blocklist
     */
    async unblockRestaurant(slug: string): Promise<boolean> {
        const settings = await this.getSettings();
        settings.blockedRestaurants = settings.blockedRestaurants.filter(s => s !== slug);
        return this.saveSettings(settings);
    }

    /**
     * Clear all blocked restaurants
     */
    async clearBlocklist(): Promise<boolean> {
        const settings = await this.getSettings();
        settings.blockedRestaurants = [];
        return this.saveSettings(settings);
    }

    /**
     * Generic get from storage (sync first, local fallback)
     */
    private async get<T>(key: string): Promise<T | null> {
        return new Promise((resolve) => {
            const storage = this.useLocalFallback ? chrome.storage.local : chrome.storage.sync;

            storage.get(key, (result) => {
                if (chrome.runtime.lastError) {
                    console.warn('[GetirFiltre] Sync storage error, trying local:', chrome.runtime.lastError);

                    if (!this.useLocalFallback) {
                        this.useLocalFallback = true;
                        chrome.storage.local.get(key, (localResult) => {
                            resolve(localResult[key] ?? null);
                        });
                        return;
                    }
                }
                resolve(result[key] ?? null);
            });
        });
    }

    /**
     * Generic set to storage (sync first, local fallback)
     */
    private async set<T>(key: string, value: T): Promise<void> {
        return new Promise((resolve, reject) => {
            const storage = this.useLocalFallback ? chrome.storage.local : chrome.storage.sync;

            storage.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    const errorMsg = chrome.runtime.lastError.message || 'Unknown error';

                    // Check for quota exceeded
                    if (errorMsg.includes('QUOTA_BYTES')) {
                        console.error('[GetirFiltre] Storage quota exceeded!');
                        reject(new Error('Storage quota exceeded'));
                        return;
                    }

                    // Try local fallback
                    if (!this.useLocalFallback) {
                        console.warn('[GetirFiltre] Sync failed, using local storage');
                        this.useLocalFallback = true;
                        chrome.storage.local.set({ [key]: value }, () => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError.message));
                            } else {
                                resolve();
                            }
                        });
                        return;
                    }

                    reject(new Error(errorMsg));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Listen for storage changes (for popup/content sync)
     */
    onSettingsChange(callback: (settings: UserSettings) => void): void {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync' || areaName === 'local') {
                if (changes[STORAGE_KEYS.SETTINGS]) {
                    const newSettings = changes[STORAGE_KEYS.SETTINGS].newValue;
                    callback({ ...DEFAULT_SETTINGS, ...newSettings });
                }
            }
        });
    }
}

// Singleton instance
export const storage = new StorageService();
