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

        // Notify content script directly for instant updates
        notifyContentScript(newSettings);
    };

    /**
     * Send settings to active GetirYemek tab for instant updates
     */
    async function notifyContentScript(settings: UserSettings): Promise<void> {
        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.id && tab.url?.includes('getir.com/yemek')) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'SETTINGS_UPDATED',
                    settings: settings,
                }).catch(() => {
                    // Tab may not have content script loaded - ignore
                });
            }
        } catch (error) {
            // Popup might not have tabs permission in all contexts - ignore
        }
    }

    // Toggle enabled
    const toggleEnabled = () => updateSetting('isEnabled', !settings.isEnabled);

    // Clear blocklist
    const clearBlocklist = async () => {
        await storage.clearBlocklist();
        setSettings((prev: UserSettings) => ({ ...prev, blockedRestaurants: [] }));
    };

    // Unblock single restaurant
    const unblockRestaurant = async (slug: string) => {
        await storage.unblockRestaurant(slug);
        setSettings((prev: UserSettings) => ({
            ...prev,
            blockedRestaurants: prev.blockedRestaurants.filter((s: string) => s !== slug),
        }));
    };

    // Replace all settings (for import/reset)
    const replaceSettings = async (newSettings: UserSettings) => {
        setSettings(newSettings);
        await storage.saveSettings(newSettings);
        notifyContentScript(newSettings);
    };

    return {
        settings,
        isLoading,
        updateSetting,
        toggleEnabled,
        clearBlocklist,
        unblockRestaurant,
        replaceSettings,
    };
}

