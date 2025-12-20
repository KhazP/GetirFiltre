import { scanRestaurantCards } from './dom-scanner';
import { processCards } from './card-manipulator';
import { storage } from '../shared/storage';
import { UserSettings } from '../shared/types';
import { TIMING, URL_PATTERNS } from '../shared/constants';
import './styles.css';

// Current settings cache
let currentSettings: UserSettings | null = null;
let isInitialized = false;

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

/**
 * Main processing function
 */
function runFilter(): void {
    if (!currentSettings || !currentSettings.isEnabled) {
        return;
    }

    const cards = scanRestaurantCards();

    if (cards.length > 0) {
        const hiddenCount = processCards(cards, currentSettings);

        if (hiddenCount > 0) {
            console.log(`[GetirFiltre] Processed ${cards.length} cards, hid ${hiddenCount}`);
        }
    }
}

// Debounced version
const debouncedRunFilter = debounce(runFilter, TIMING.DEBOUNCE_MS);

/**
 * Set up MutationObserver
 */
function setupObserver(): void {
    const observer = new MutationObserver((mutations) => {
        // Check if any mutations added nodes that might be restaurant cards
        let hasNewNodes = false;

        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof HTMLElement) {
                        // Check if it's a potential card or container of cards
                        if (node.tagName === 'ARTICLE' || node.querySelector?.('article')) {
                            hasNewNodes = true;
                            break;
                        }
                    }
                }
            }
            if (hasNewNodes) break;
        }

        if (hasNewNodes) {
            debouncedRunFilter();
        }
    });

    // Observe the body for new restaurant cards (infinite scroll)
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    console.log('[GetirFiltre] MutationObserver active');
}

/**
 * Initialize the content script
 */
async function init(): Promise<void> {
    // Check if we're on the right page
    if (!URL_PATTERNS.RESTAURANTS_PAGE.test(window.location.href)) {
        console.log('[GetirFiltre] Not on restaurants page, skipping');
        return;
    }

    if (isInitialized) {
        return;
    }

    console.log('[GetirFiltre] Initializing on GetirYemek...');

    // Load settings
    currentSettings = await storage.getSettings();
    console.log('[GetirFiltre] Settings loaded:', currentSettings);

    // Listen for settings changes
    storage.onSettingsChange((newSettings) => {
        console.log('[GetirFiltre] Settings updated:', newSettings);
        currentSettings = newSettings;

        // Re-run filter with new settings
        // Note: This won't un-hide cards that were hidden before
        // A page refresh is needed for that
        debouncedRunFilter();
    });

    // Initial run
    runFilter();

    // Set up observer for infinite scroll
    setupObserver();

    isInitialized = true;
    console.log('[GetirFiltre] Ready! 🚀');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Also handle SPA navigation
let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        isInitialized = false;
        init();
    }
});

urlObserver.observe(document.body, {
    childList: true,
    subtree: true,
});
