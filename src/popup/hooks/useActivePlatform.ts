import { useEffect, useState } from 'react';
import { PlatformId } from '../../shared/types';
import {
    DEFAULT_PLATFORM_ID,
    PLATFORMS,
    PlatformInfo,
    FeatureKey,
    platformFromUrl,
    supports,
} from '../../shared/platforms';

interface ActivePlatform {
    /** Platform used for branding and feature gating. Falls back to the default. */
    platform: PlatformInfo;
    /** True when the active tab really is one of the supported sites. */
    isOnSite: boolean;
    /** Is this filter meaningful on the active site? */
    has: (feature: FeatureKey) => boolean;
}

/**
 * Ask the content script of the active tab which site it runs on.
 *
 * The content script answers, so no extra host permission is needed - reading
 * `tab.url` from the popup would need one.
 */
export function useActivePlatform(): ActivePlatform {
    const [platformId, setPlatformId] = useState<PlatformId | null>(null);

    useEffect(() => {
        if (typeof chrome === 'undefined' || !chrome.tabs?.query) {
            return;
        }

        let cancelled = false;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
                console.warn('[GetirFiltre] Tab query failed:', chrome.runtime.lastError);
                return;
            }

            const tab = tabs[0];
            if (!tab?.id) return;

            // Fast path: the popup may already see the URL (options page, dev)
            const fromUrl = platformFromUrl(tab.url);
            if (fromUrl && !cancelled) {
                setPlatformId(fromUrl.id);
                return;
            }

            chrome.tabs.sendMessage(tab.id, { type: 'GET_PLATFORM' }, (response) => {
                if (chrome.runtime.lastError) {
                    // No content script on this tab - stay on the default brand
                    return;
                }
                if (!cancelled && response?.platform) {
                    setPlatformId(response.platform as PlatformId);
                }
            });
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const platform = PLATFORMS[platformId ?? DEFAULT_PLATFORM_ID];

    // Theme tokens follow the site (see index.css)
    useEffect(() => {
        document.documentElement.dataset.platform = platform.id;
    }, [platform.id]);

    return {
        platform,
        isOnSite: platformId !== null,
        has: (feature: FeatureKey) => supports(platform, feature),
    };
}
