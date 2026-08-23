import { useEffect, useState } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '../../shared/types';
import { storage } from '../../shared/storage';

export function useSettings() {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial settings
    useEffect(() => {
        storage.getSettings().then((loaded: UserSettings) => {
            setSettings(loaded);
            setIsLoading(false);
        });
    }, []);

    // Listen for changes
    useEffect(() => {
        storage.onSettingsChange((newSettings: UserSettings) => {
            setSettings(newSettings);
        });
    }, []);

    // Update a single setting
    const updateSetting = async <K extends keyof UserSettings>(
        key: K,
        value: UserSettings[K]
    ) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await storage.saveSettings(newSettings);
    };

    // Toggle enabled
    const toggleEnabled = () => updateSetting('isEnabled', !settings.isEnabled);

    // Clear blocklist
    const clearBlocklist = async () => {
        await storage.clearBlocklist();
        setSettings((prev: UserSettings) => ({
            ...prev,
            blockedRestaurants: [],
            blockedKeywords: [],
        }));
    };

    // Unblock single restaurant
    const unblockRestaurant = async (slug: string) => {
        await storage.unblockRestaurant(slug);
        setSettings((prev: UserSettings) => ({
            ...prev,
            blockedRestaurants: prev.blockedRestaurants.filter((s: string) => s !== slug),
        }));
    };

    // Block single keyword
    const blockKeyword = async (keyword: string) => {
        await storage.blockKeyword(keyword);
        const normalized = keyword.trim().toLowerCase();
        setSettings((prev: UserSettings) => {
            if (normalized && !prev.blockedKeywords.includes(normalized)) {
                return {
                    ...prev,
                    blockedKeywords: [...prev.blockedKeywords, normalized],
                };
            }
            return prev;
        });
    };

    // Unblock single keyword
    const unblockKeyword = async (keyword: string) => {
        await storage.unblockKeyword(keyword);
        const normalized = keyword.trim().toLowerCase();
        setSettings((prev: UserSettings) => ({
            ...prev,
            blockedKeywords: prev.blockedKeywords.filter((k: string) => k !== normalized),
        }));
    };

    // Replace all settings (for import/reset)
    const replaceSettings = async (newSettings: UserSettings) => {
        setSettings(newSettings);
        await storage.saveSettings(newSettings);
    };

    return {
        settings,
        isLoading,
        updateSetting,
        toggleEnabled,
        clearBlocklist,
        unblockRestaurant,
        blockKeyword,
        unblockKeyword,
        replaceSettings,
    };
}

