/**
 * GetirFiltre anonymous, opt-out usage telemetry.
 *
 * What ever leaves the browser is exactly this, and nothing else:
 *   { app, key, installId, version, events: [{ name, count }] }
 * where every `name` comes from the fixed EVENT_NAMES list below.
 *
 * Never sent: restaurant names, slugs, blocked keywords, filter values, URLs,
 * page content, prices, ratings, search terms, or anything the user typed.
 *
 * The service worker is the only writer. The content script and the popup fire
 * events through `sendTelemetryEvent`, which posts a message instead of touching
 * the buffer, so concurrent contexts cannot clobber each other's writes.
 *
 * Everything here swallows its own errors: telemetry must never throw into, block
 * or slow down filtering.
 */

import { EVENT_NAMES, TELEMETRY_MESSAGE_TYPE, type TelemetryEvent } from './telemetry-events';

export { EVENT_NAMES, TELEMETRY_MESSAGE_TYPE, sendTelemetryEvent } from './telemetry-events';
export type { TelemetryEvent } from './telemetry-events';

// Replaced at build time, or edited by hand before release. Neither value is a
// secret: the key is baked into the published bundle and only acts as a spam
// filter for the ingest endpoint.
const INGEST_URL = 'https://alp-dashboard-api.alpyalay.workers.dev/api/ingest/extension';
const INGEST_KEY = 'a0dfc109926f7695976ddf116a2186206bd75928530c72adff87d9007d03ed93';

const APP_SLUG = 'getirfiltre';


// Deliberately separate from `getirfiltre_settings`: that object goes through
// chrome.storage.sync, and the install ID must never replicate across devices.
const ENABLED_KEY = 'getirfiltre_telemetry_enabled'; // absent means on (opt-out)
const INSTALL_ID_KEY = 'getirfiltre_telemetry_install_id';
const BUFFER_KEY = 'getirfiltre_telemetry_buffer';
const VERSION_KEY = 'getirfiltre_telemetry_version';
const SESSION_KEY = 'getirfiltre_telemetry_session';

const ALARM_NAME = 'getirfiltre-telemetry-flush';
const FLUSH_PERIOD_MINUTES = 30;
const MAX_BUFFERED_EVENTS = 100;

interface IngestBody {
    app: string;
    key: string;
    installId: string;
    version: string;
    events: Array<{ name: TelemetryEvent; count: number }>;
}

function isSupported(): boolean {
    return typeof chrome !== 'undefined'
        && Boolean(chrome.storage?.local)
        && Boolean(chrome.runtime?.getManifest);
}

async function getLocal<T>(key: string): Promise<T | undefined> {
    try {
        const result = await chrome.storage.local.get(key);
        return result?.[key] as T | undefined;
    } catch {
        return undefined;
    }
}

async function setLocal(items: Record<string, unknown>): Promise<void> {
    try {
        await chrome.storage.local.set(items);
    } catch {
        // Fail silent.
    }
}

async function removeLocal(keys: string[]): Promise<void> {
    try {
        await chrome.storage.local.remove(keys);
    } catch {
        // Fail silent.
    }
}

/** Telemetry is on by default; only an explicit `false` turns it off. */
export async function isTelemetryEnabled(): Promise<boolean> {
    if (!isSupported()) return false;
    return (await getLocal<boolean>(ENABLED_KEY)) !== false;
}

/** Created once and never derived from anything about the user or their browser. */
async function getInstallId(): Promise<string> {
    const existing = await getLocal<string>(INSTALL_ID_KEY);
    if (existing) return existing;
    const installId = crypto.randomUUID();
    await setLocal({ [INSTALL_ID_KEY]: installId });
    return installId;
}

// Buffer access is read-modify-write, so every mutation is serialized through one
// chain. Two events recorded in the same tick would otherwise clobber each other.
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const next = writeQueue.then(task, task);
    writeQueue = next.catch(() => undefined);
    return next;
}

/**
 * Buffer one event, by name only. Names are aggregated into counts at flush time,
 * so the payload never reveals when any single action happened.
 *
 * Service-worker context only. Other contexts use `sendTelemetryEvent`.
 */
export function recordEvent(name: TelemetryEvent): Promise<void> {
    return enqueue(async () => {
        try {
            if (!isSupported()) return;
            if (!(EVENT_NAMES as readonly string[]).includes(name)) return;
            if (!(await isTelemetryEnabled())) return;

            const stored = await getLocal<TelemetryEvent[]>(BUFFER_KEY);
            const buffer = Array.isArray(stored) ? stored : [];
            buffer.push(name);
            // Oldest first out, so a long offline stretch cannot grow storage without bound.
            await setLocal({ [BUFFER_KEY]: buffer.slice(-MAX_BUFFERED_EVENTS) });
        } catch {
            // Fail silent.
        }
    });
}

function aggregate(buffer: TelemetryEvent[]): IngestBody['events'] {
    const counts = new Map<TelemetryEvent, number>();
    for (const name of buffer) {
        if (!(EVENT_NAMES as readonly string[]).includes(name)) continue;
        counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts].map(([name, count]) => ({ name, count }));
}

export async function flushTelemetry(): Promise<void> {
    // Draining runs under the same lock as recordEvent, so an event recorded while
    // the request is in flight lands in the next batch instead of vanishing.
    const events = await enqueue<IngestBody['events']>(async () => {
        try {
            if (!isSupported()) return [];
            if (!(await isTelemetryEnabled())) return [];

            const stored = await getLocal<TelemetryEvent[]>(BUFFER_KEY);
            const drained = aggregate(Array.isArray(stored) ? stored : []);
            if (drained.length === 0) return [];

            // Cleared before the request, not after: a failed send drops the batch
            // rather than retrying forever and double-counting on the server.
            await removeLocal([BUFFER_KEY]);
            return drained;
        } catch {
            return [];
        }
    });

    try {
        if (events.length === 0) return;

        const body: IngestBody = {
            app: APP_SLUG,
            key: INGEST_KEY,
            installId: await getInstallId(),
            version: chrome.runtime.getManifest().version,
            events,
        };

        // No host_permissions needed: the endpoint is CORS-open.
        const response = await fetch(INGEST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) return; // Any non-2xx is a no-op.
    } catch {
        // Offline, blocked, or endpoint down: treat as a no-op.
    }
}

/** A single alarm. setInterval would die with the MV3 service worker. */
function scheduleFlush(): void {
    try {
        chrome.alarms?.create(ALARM_NAME, { periodInMinutes: FLUSH_PERIOD_MINUTES });
    } catch {
        // Alarms unavailable: events stay buffered until the next startup.
    }
}

/** Reported once per browser session; the marker dies with the browser. */
async function markSession(): Promise<void> {
    try {
        if (!chrome.storage?.session) {
            await recordEvent('ext_active');
            return;
        }
        const stored = await chrome.storage.session.get(SESSION_KEY);
        if (stored?.[SESSION_KEY]) return;
        await chrome.storage.session.set({ [SESSION_KEY]: true });
        await recordEvent('ext_active');
    } catch {
        // Fail silent.
    }
}

/**
 * Tells a first install from an upgrade without reading onInstalled.previousVersion,
 * so a worker that wakes mid-upgrade still gets it right.
 */
async function recordLifecycle(): Promise<void> {
    try {
        if (!isSupported()) return;
        const version = chrome.runtime.getManifest().version;
        const previous = await getLocal<string>(VERSION_KEY);
        if (!previous) {
            await recordEvent('ext_installed');
        } else if (previous !== version) {
            await recordEvent('ext_updated');
        }
        if (previous !== version) await setLocal({ [VERSION_KEY]: version });
    } catch {
        // Fail silent.
    }
}

let listenerAttached = false;

/** Safe to call on every service-worker wake-up. */
export function initTelemetry(): void {
    try {
        if (!isSupported()) return;

        if (!listenerAttached) {
            listenerAttached = true;
            chrome.alarms?.onAlarm.addListener((alarm) => {
                if (alarm?.name === ALARM_NAME) void flushTelemetry();
            });
            chrome.runtime.onMessage.addListener((message) => {
                if (message?.type === TELEMETRY_MESSAGE_TYPE) {
                    void recordEvent(message.event);
                }
                return false;
            });
        }

        scheduleFlush();
        void recordLifecycle().then(markSession);
    } catch {
        // Fail silent.
    }
}

/**
 * Called by the settings UI. Turning telemetry off deletes the install ID and every
 * buffered event immediately; turning it back on mints a brand new ID, so the two
 * periods cannot be linked.
 */
export async function setTelemetryEnabled(enabled: boolean): Promise<void> {
    try {
        await setLocal({ [ENABLED_KEY]: enabled });
        if (!enabled) {
            await removeLocal([INSTALL_ID_KEY, BUFFER_KEY]);
            try {
                await chrome.alarms?.clear(ALARM_NAME);
            } catch {
                // Nothing to clear.
            }
            return;
        }
        await getInstallId();
        scheduleFlush();
    } catch {
        // Fail silent.
    }
}
