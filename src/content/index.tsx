import { scanRestaurantCards } from './dom-scanner';
import { processCards, showCard, hideCard } from './card-manipulator';
import { storage } from '../shared/storage';
import { UserSettings } from '../shared/types';
import { TIMING, URL_PATTERNS, CSS_CLASSES } from '../shared/constants';

// Inject CSS directly into page
const cssStyles = `
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

article:hover .getirfiltre-btn-container,
[class*="restaurant"]:hover .getirfiltre-btn-container,
[class*="Restaurant"]:hover .getirfiltre-btn-container {
  opacity: 1;
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
  cursor: pointer;
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
`;

function injectStyles(): void {
    if (document.getElementById('getirfiltre-styles')) return;
    const style = document.createElement('style');
    style.id = 'getirfiltre-styles';
    style.textContent = cssStyles;
    document.head.appendChild(style);
}

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
 * Re-evaluate all processed cards when settings change
 * This allows instant un-hiding when restaurants are unblocked
 */
function reEvaluateAllCards(newSettings: UserSettings, oldSettings: UserSettings | null): void {
    // If extension is disabled, show all hidden cards
    if (!newSettings.isEnabled) {
        const hiddenCards = document.querySelectorAll<HTMLElement>(`.${CSS_CLASSES.HIDDEN}`);
        hiddenCards.forEach((el) => showCard(el));
        console.log(`[GetirFiltre] Disabled - showed ${hiddenCards.length} cards`);
        return;
    }

    // Find all processed cards (including hidden ones)
    const processedCards = document.querySelectorAll<HTMLElement>(`.${CSS_CLASSES.PROCESSED}`);

    processedCards.forEach((element) => {
        // Extract slug from the card's restaurant link
        const link = element.querySelector<HTMLAnchorElement>('a[href*="/yemek/restoran/"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        const slugMatch = href.match(/\/yemek\/restoran\/([^/]+)\//);
        if (!slugMatch) return;

        const slug = slugMatch[1];

        // Check if this card should be visible
        const isBlocked = newSettings.blockedRestaurants.includes(slug);
        const wasBlocked = oldSettings?.blockedRestaurants.includes(slug) ?? false;

        // If unblocked, show the card
        if (wasBlocked && !isBlocked) {
            showCard(element);
            console.log(`[GetirFiltre] Unblocked: ${slug}`);
        }
        // If newly blocked, hide the card
        else if (!wasBlocked && isBlocked) {
            hideCard(element);
            console.log(`[GetirFiltre] Blocked: ${slug}`);
        }
    });

    // Also run the standard filter for any new cards
    runFilter();
}

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

    // Inject styles first
    injectStyles();

    // Load settings
    currentSettings = await storage.getSettings();
    console.log('[GetirFiltre] Settings loaded:', currentSettings);

    // Listen for settings changes
    storage.onSettingsChange((newSettings) => {
        console.log('[GetirFiltre] Settings updated:', newSettings);
        const oldSettings = currentSettings;
        currentSettings = newSettings;

        // Re-evaluate all cards for instant show/hide
        reEvaluateAllCards(newSettings, oldSettings);
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
