import { scanRestaurantCards } from './dom-scanner';
import { processCards, showCard } from './card-manipulator';
import { storage } from '../shared/storage';
import { UserSettings } from '../shared/types';
import { TIMING, CSS_CLASSES } from '../shared/constants';
import { detectPlatform, PlatformAdapter, storageKey } from './platforms';
import { sendTelemetryEvent } from '../shared/telemetry-events';

// Base styles, shared by every platform. Site-specific rules come from the adapter.
const baseStyles = `
/* GetirFiltre Content Script Styles */
.getirfiltre-hidden {
  display: none !important;
}

.getirfiltre-btn-container {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: auto;
}

.getirfiltre-block-btn {
  pointer-events: auto;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.getirfiltre-block-btn:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.getirfiltre-block-btn:active {
  transform: scale(0.95);
}

/* Restaurant detail page block button - persistent */
.getirfiltre-restaurant-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  vertical-align: middle;
}

.getirfiltre-restaurant-page-btn:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.getirfiltre-restaurant-page-btn:active {
  transform: scale(0.95);
}
`;

function injectStyles(adapter: PlatformAdapter): void {
    if (document.getElementById('getirfiltre-styles')) return;

    const style = document.createElement('style');
    style.id = 'getirfiltre-styles';
    style.textContent = baseStyles + adapter.css;
    document.head.appendChild(style);
}

const platform = detectPlatform();

let currentSettings: UserSettings | null = null;
let isInitialized = false;
let listeningForSettings = false;
let totalHiddenCount = 0;
let activeListingsObserver: MutationObserver | null = null;
let activeDetailObserver: MutationObserver | null = null;
// Reported at most once per page load: the observer re-runs the filter on every
// infinite-scroll batch, and one count per page is the useful signal.
let filterEventSent = false;

/**
 * Send badge update to background script
 */
function sendBadgeUpdate(): void {
    try {
        chrome.runtime.sendMessage({
            type: 'UPDATE_BADGE',
            hiddenCount: totalHiddenCount,
            isEnabled: currentSettings?.isEnabled ?? true,
            platform: platform?.id ?? null,
        });
    } catch {
        // Ignore errors (e.g., extension context invalidated)
    }
}

/**
 * The popup asks which site this tab is on, so it can show the right brand
 * and only the filters this site supports.
 */
function listenForPlatformRequests(): void {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message?.type === 'GET_PLATFORM') {
            sendResponse({ platform: platform?.id ?? null });
        }
        return false;
    });
}

/**
 * Debounce function
 */
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return ((...args: unknown[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => fn(...args), ms);
    }) as T;
}

function showAllHiddenCards(): number {
    const hidden = document.querySelectorAll<HTMLElement>(`.${CSS_CLASSES.HIDDEN}`);
    hidden.forEach((element) => showCard(element));
    return hidden.length;
}

/**
 * Main processing function.
 * `includeProcessed` re-checks cards that were already handled - used after a
 * settings change so filters apply instantly, without a page reload.
 */
function runFilter(includeProcessed = false): void {
    if (!platform || !currentSettings) {
        return;
    }

    try {
        // Section visibility applies even when the filters are off
        platform.applySectionVisibility(currentSettings);
    } catch (error) {
        console.warn('[GetirFiltre] Section visibility failed:', error);
    }

    if (!currentSettings.isEnabled) {
        const shown = showAllHiddenCards();
        if (shown > 0) {
            console.log(`[GetirFiltre] Disabled - showed ${shown} cards`);
        }
        totalHiddenCount = 0;
        sendBadgeUpdate();
        return;
    }

    const cards = scanRestaurantCards(platform, includeProcessed);

    if (cards.length > 0) {
        const hiddenCount = processCards(cards, currentSettings, platform);
        console.log(
            `[GetirFiltre] Processed ${cards.length} cards on ${platform.label}, hid ${hiddenCount}`
        );
        if (hiddenCount > 0 && !filterEventSent) {
            filterEventSent = true;
            sendTelemetryEvent('ext_filter_applied');
        }
    }

    totalHiddenCount = document.querySelectorAll(`.${CSS_CLASSES.HIDDEN}`).length;
    sendBadgeUpdate();
}

const debouncedRunFilter = debounce(() => runFilter(), TIMING.DEBOUNCE_MS);

function setupObserver(): void {
    if (!platform) return;

    if (activeListingsObserver) {
        activeListingsObserver.disconnect();
    }

    activeListingsObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLElement && platform.isCardMutation(node)) {
                    debouncedRunFilter();
                    return;
                }
            }
        }
    });

    // Infinite scroll / "show more" adds cards long after load
    activeListingsObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });

    console.log('[GetirFiltre] Listings MutationObserver active');
}

/**
 * Inject a block button on the restaurant detail page
 */
function injectRestaurantPageBlockButton(): void {
    if (!platform) return;
    if (document.querySelector(`.${CSS_CLASSES.RESTAURANT_PAGE_BLOCK_BUTTON}`)) {
        return;
    }

    const slug = platform.detailSlug(window.location.href);
    if (!slug) return;

    const button = document.createElement('button');
    button.className = CSS_CLASSES.RESTAURANT_PAGE_BLOCK_BUTTON;
    button.innerHTML = '×';
    button.title = 'Restoran Gizle (Block Restaurant)';
    button.setAttribute('aria-label', 'Block this restaurant');

    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const name = platform.detailName() || slug;
        await storage.blockRestaurant(storageKey(platform.id, slug), name);
        sendTelemetryEvent('ext_block_added');

        button.innerHTML = '✓';
        button.style.background = 'rgba(34, 197, 94, 0.9)';
        button.title = 'Blocked!';

        console.log(`[GetirFiltre] Blocked restaurant from detail page: ${name}`);

        setTimeout(() => {
            window.history.back();
        }, 500);
    });

    let mounted = false;
    try {
        mounted = platform.mountDetailButton(button);
    } catch (error) {
        console.warn('[GetirFiltre] Could not mount detail button:', error);
    }

    if (mounted) {
        console.log(`[GetirFiltre] Injected block button on restaurant page: ${slug}`);
    }
}

/**
 * Initialize the content script
 */
async function init(): Promise<void> {
    if (!platform) {
        return;
    }

    const url = window.location.href;
    const isDetailPage = platform.detailSlug(url) !== null;

    if (!isDetailPage && !platform.hasListings(url)) {
        console.log('[GetirFiltre] Not on a supported page, skipping');
        return;
    }

    if (isInitialized) {
        return;
    }

    console.log(`[GetirFiltre] Initializing on ${platform.label}...`);

    injectStyles(platform);

    currentSettings = await storage.getSettings();

    if (isDetailPage) {
        if (activeListingsObserver) {
            activeListingsObserver.disconnect();
            activeListingsObserver = null;
        }

        // The header renders after the first paint
        setTimeout(injectRestaurantPageBlockButton, 500);

        activeDetailObserver?.disconnect();
        activeDetailObserver = new MutationObserver(() => {
            injectRestaurantPageBlockButton();
        });
        activeDetailObserver.observe(document.body, { childList: true, subtree: true });

        isInitialized = true;
        console.log('[GetirFiltre] Restaurant detail page ready! 🚀');
        return;
    }

    if (activeDetailObserver) {
        activeDetailObserver.disconnect();
        activeDetailObserver = null;
    }

    // Storage is the source of truth: react to changes from popup or options
    if (!listeningForSettings) {
        listeningForSettings = true;
        storage.onSettingsChange((newSettings) => {
            currentSettings = newSettings;
            runFilter(true);
        });
    }

    runFilter();
    setupObserver();

    isInitialized = true;
    console.log('[GetirFiltre] Ready! 🚀');
}

if (platform) {
    listenForPlatformRequests();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init().catch((error) => console.warn('[GetirFiltre] Init failed:', error));
        });
    } else {
        init().catch((error) => console.warn('[GetirFiltre] Init failed:', error));
    }

    // Handle SPA navigation
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            isInitialized = false;
            filterEventSent = false;
            init().catch((error) => console.warn('[GetirFiltre] Init failed:', error));
        }
    });

    urlObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}
