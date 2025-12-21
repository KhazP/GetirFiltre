/**
 * GetirFiltre Background Service Worker
 * Handles extension lifecycle events and badge updates
 */

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
});

// Listen for messages from content script to update badge
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'UPDATE_BADGE') {
        const { hiddenCount, isEnabled } = message;

        if (!isEnabled) {
            // Extension disabled - show "OFF" badge
            chrome.action.setBadgeText({ text: 'OFF', tabId: sender.tab?.id });
            chrome.action.setBadgeBackgroundColor({ color: '#6b7280', tabId: sender.tab?.id });
        } else if (hiddenCount > 0) {
            // Show hidden count
            const badgeText = hiddenCount > 99 ? '99+' : hiddenCount.toString();
            chrome.action.setBadgeText({ text: badgeText, tabId: sender.tab?.id });
            chrome.action.setBadgeBackgroundColor({ color: '#a855f7', tabId: sender.tab?.id });
        } else {
            // No hidden restaurants - clear badge
            chrome.action.setBadgeText({ text: '', tabId: sender.tab?.id });
        }
    }

    // Return true to indicate we handled the message
    return true;
});

export { };

