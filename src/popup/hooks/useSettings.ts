import { useEffect, useState } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '../shared/types';
import { storage } from '../shared/storage';

export function useSettings() {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial settings
    useEffect(() => {
        storage.getSettings().then((loaded) => {
            setSettings(loaded);
            setIsLoading(false);
        });
    }, []);

    // Listen for changes
    useEffect(() => {
        storage.onSettingsChange((newSettings) => {
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
        setSettings((prev) => ({ ...prev, blockedRestaurants: [] }));
    };

    // Unblock single restaurant
    const unblockRestaurant = async (slug: string) => {
        await storage.unblockRestaurant(slug);
        setSettings((prev) => ({
            ...prev,
            blockedRestaurants: prev.blockedRestaurants.filter((s) => s !== slug),
        }));
    };

    return {
        settings,
        isLoading,
        updateSetting,
        toggleEnabled,
        clearBlocklist,
        unblockRestaurant,
    };
}
