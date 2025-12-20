/**
 * GetirFiltre Background Service Worker
 * Handles extension lifecycle events
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

export { };
