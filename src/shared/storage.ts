import { UserSettings, DEFAULT_SETTINGS } from './types';
import { STORAGE_KEYS } from './constants';

/**
 * Storage wrapper with sync primary, local fallback
 */
class StorageService {
    /**
     * Get settings from storage
     */
    async getSettings(): Promise<UserSettings> {
        try {
            const [syncResult, localResult] = await Promise.all([
                this.getSync<any>(STORAGE_KEYS.SETTINGS),
                this.getLocal<any>(STORAGE_KEYS.SETTINGS),
            ]);

            const merged: UserSettings = {
                ...DEFAULT_SETTINGS,
                ...(syncResult || {}),
                ...(localResult || {}),
            };

            // Older installs have no name map, and blocklists must stay iterable
            return {
                ...merged,
                blockedRestaurants: merged.blockedRestaurants ?? [],
                blockedKeywords: merged.blockedKeywords ?? [],
                blockedNames: merged.blockedNames ?? {},
            };
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
            const { blockedRestaurants, blockedKeywords, blockedNames, ...syncSettings } = settings;
            const localSettings = { blockedRestaurants, blockedKeywords, blockedNames };

            await Promise.all([
                this.setSync(STORAGE_KEYS.SETTINGS, syncSettings),
                this.setLocal(STORAGE_KEYS.SETTINGS, localSettings),
            ]);
            return true;
        } catch (error) {
            console.error('[GetirFiltre] Storage write error:', error);
            return false;
        }
    }

    /**
     * Add a restaurant to blocklist.
     * `key` is platform scoped ("tgo:1833"); Getir keys stay bare slugs.
     * `name` is kept for display, since some platforms use numeric ids.
     */
    async blockRestaurant(key: string, name?: string): Promise<boolean> {
        const settings = await this.getSettings();
        let changed = false;

        if (!settings.blockedRestaurants.includes(key)) {
            settings.blockedRestaurants.push(key);
            changed = true;
        }

        if (name && settings.blockedNames[key] !== name) {
            settings.blockedNames = { ...settings.blockedNames, [key]: name };
            changed = true;
        }

        return changed ? this.saveSettings(settings) : true;
    }

    /**
     * Remove a restaurant from blocklist
     */
    async unblockRestaurant(key: string): Promise<boolean> {
        const settings = await this.getSettings();
        settings.blockedRestaurants = settings.blockedRestaurants.filter(s => s !== key);

        const { [key]: _removed, ...remainingNames } = settings.blockedNames;
        settings.blockedNames = remainingNames;

        return this.saveSettings(settings);
    }

    /**
     * Add a keyword to blocklist
     */
    async blockKeyword(keyword: string): Promise<boolean> {
        const settings = await this.getSettings();
        const normalized = keyword.trim().toLowerCase();
        if (normalized && !settings.blockedKeywords.includes(normalized)) {
            settings.blockedKeywords.push(normalized);
            return this.saveSettings(settings);
        }
        return true;
    }

    /**
     * Remove a keyword from blocklist
     */
    async unblockKeyword(keyword: string): Promise<boolean> {
        const settings = await this.getSettings();
        const normalized = keyword.trim().toLowerCase();
        settings.blockedKeywords = settings.blockedKeywords.filter(k => k !== normalized);
        return this.saveSettings(settings);
    }

    /**
     * Clear all blocked restaurants and keywords
     */
    async clearBlocklist(): Promise<boolean> {
        const settings = await this.getSettings();
        settings.blockedRestaurants = [];
        settings.blockedNames = {};
        settings.blockedKeywords = [];
        return this.saveSettings(settings);
    }

    /**
     * Get from sync storage
     */
    private async getSync<T>(key: string): Promise<T | null> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(key, (result) => {
                if (chrome.runtime.lastError) {
                    console.warn('[GetirFiltre] Sync storage read error:', chrome.runtime.lastError);
                    resolve(null);
                } else {
                    resolve(result[key] ?? null);
                }
            });
        });
    }

    /**
     * Get from local storage
     */
    private async getLocal<T>(key: string): Promise<T | null> {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (result) => {
                if (chrome.runtime.lastError) {
                    console.warn('[GetirFiltre] Local storage read error:', chrome.runtime.lastError);
                    resolve(null);
                } else {
                    resolve(result[key] ?? null);
                }
            });
        });
    }

    /**
     * Set to sync storage
     */
    private async setSync<T>(key: string, value: T): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Set to local storage
     */
    private async setLocal<T>(key: string, value: T): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
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
        // Absent outside the extension context (e.g. vite dev preview)
        if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) {
            console.warn('[GetirFiltre] Storage events unavailable');
            return;
        }

        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync' || areaName === 'local') {
                if (changes[STORAGE_KEYS.SETTINGS]) {
                    this.getSettings().then(callback);
                }
            }
        });
    }
}

// Singleton instance
export const storage = new StorageService();
