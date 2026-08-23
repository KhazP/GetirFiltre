/**
 * GetirFiltre Background Service Worker
 * Handles extension lifecycle events and badge updates
 */
import { PLATFORMS } from '../shared/platforms';
import { PlatformId } from '../shared/types';
import { initTelemetry, flushTelemetry } from '../shared/telemetry';

// Anonymous usage counts. Registers the message and alarm listeners, so it has to
// run at top level on every worker wake-up, not only from onInstalled.
initTelemetry();

// On install
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('[GetirFiltre] Extension installed!');

        // Could show onboarding page here
        // chrome.tabs.create({ url: 'onboarding.html' });
    } else if (details.reason === 'update') {
        console.log('[GetirFiltre] Extension updated to version', chrome.runtime.getManifest().version);
    }
});

// Keep service worker alive (optional, for future features)
chrome.runtime.onStartup.addListener(() => {
    console.log('[GetirFiltre] Browser started');
    initTelemetry();
    void flushTelemetry();
});

// Listen for messages from content script to update badge
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'UPDATE_BADGE') {
        const { hiddenCount, isEnabled, platform } = message;
        const tabId = sender.tab?.id;
        const info = platform ? PLATFORMS[platform as PlatformId] : undefined;

        // The popup rebrands per site, so the toolbar follows it
        if (info && tabId !== undefined) {
            chrome.action.setTitle({ title: `${info.brand} - ${info.site}`, tabId });
        }

        if (!isEnabled) {
            // Extension disabled - show "OFF" badge
            chrome.action.setBadgeText({ text: 'OFF', tabId });
            chrome.action.setBadgeBackgroundColor({ color: '#6b7280', tabId });
        } else if (hiddenCount > 0) {
            // Show hidden count
            const badgeText = hiddenCount > 99 ? '99+' : hiddenCount.toString();
            chrome.action.setBadgeText({ text: badgeText, tabId });
            chrome.action.setBadgeBackgroundColor({
                color: info?.badgeColor ?? '#a855f7',
                tabId,
            });
        } else {
            // No hidden restaurants - clear badge
            chrome.action.setBadgeText({ text: '', tabId });
        }
    }

    // Return true to indicate we handled the message
    return true;
});

export { };

