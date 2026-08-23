/**
 * The event vocabulary and the content-script sender, deliberately kept apart
 * from `telemetry.ts`.
 *
 * `telemetry.ts` holds the ingest URL and key. Content scripts run in the page
 * context on getir.com, so importing anything from that module drags the key
 * into a bundle that any script on the page can read. Nothing here has a
 * secret in it: the sender only posts a message to the service worker, which
 * remains the single writer.
 */

export const EVENT_NAMES = [
    'ext_installed',      // first install, once
    'ext_updated',        // extension version changed
    'ext_active',         // once per browser session
    'ext_filter_applied', // filters hid at least one card on a page
    'ext_block_added',    // a restaurant was blocked
] as const;

export type TelemetryEvent = (typeof EVENT_NAMES)[number];

export const TELEMETRY_MESSAGE_TYPE = 'TELEMETRY_EVENT';

/**
 * Fire an event from a content script or popup. One line at the call site, and
 * it keeps the service worker the sole writer of the buffer.
 */
export function sendTelemetryEvent(name: TelemetryEvent): void {
    try {
        chrome.runtime.sendMessage({ type: TELEMETRY_MESSAGE_TYPE, event: name }, () => {
            // Reading lastError stops "Unchecked runtime.lastError" noise when the
            // worker is asleep or the extension context was invalidated.
            void chrome.runtime.lastError;
        });
    } catch {
        // Fail silent.
    }
}
