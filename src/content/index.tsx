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
let totalHiddenCount = 0; // Track total hidden restaurants for badge

/**
 * Listen for direct messages from popup for instant updates
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'SETTINGS_UPDATED' && message.settings) {
        console.log('[GetirFiltre] Received settings update from popup');
        currentSettings = message.settings;

        // Apply changes immediately
        manageSectionVisibility(message.settings);
        reEvaluateAllCards(message.settings);

        sendResponse({ success: true });
    }
    return true; // Keep channel open for async response
});

/**
 * Send badge update to background script
 */
function sendBadgeUpdate(): void {
    try {
        chrome.runtime.sendMessage({
            type: 'UPDATE_BADGE',
            hiddenCount: totalHiddenCount,
            isEnabled: currentSettings?.isEnabled ?? true,
        });
    } catch {
        // Ignore errors (e.g., extension context invalidated)
    }
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

/**
 * Manage visibility of page sections (carousels, promo sections)
 */
function manageSectionVisibility(settings: UserSettings): void {
    // Hide/show top campaign carousel (first carousel that's not inside a card)
    const topCarousels = document.querySelectorAll('div[data-testid="carousel"]');
    const topCarousel = topCarousels[0] as HTMLElement | undefined;
    if (topCarousel && !topCarousel.closest('div[data-testid="card"]')) {
        topCarousel.style.display = settings.hideCampaignCarousel ? 'none' : '';
    }

    // Find Müdavim and ACIKTIYSAN sections by their card containers
    // These are div[data-testid="card"] elements containing H5 headers with specific text
    const allCards = document.querySelectorAll<HTMLElement>('div[data-testid="card"]');

    allCards.forEach((card) => {
        const h5 = card.querySelector('h5[data-testid="title"]');
        if (!h5) return;

        const text = h5.textContent || '';

        // Müdavim section
        if (text.includes('Müdavim')) {
            card.style.display = settings.hideMudavimSection ? 'none' : '';
        }
        // ACIKTIYSAN section  
        else if (text.includes('ACIKTIYSAN')) {
            card.style.display = settings.hideAciktiysanSection ? 'none' : '';
        }
    });
}

/**
 * Main processing function
 */
function runFilter(): void {
    if (!currentSettings) {
        return;
    }

    // Always manage section visibility (even when filters are disabled)
    manageSectionVisibility(currentSettings);

    if (!currentSettings.isEnabled) {
        totalHiddenCount = 0;
        sendBadgeUpdate();
        return;
    }

    const cards = scanRestaurantCards();

    if (cards.length > 0) {
        const hiddenCount = processCards(cards, currentSettings);
        totalHiddenCount = document.querySelectorAll('.getirfiltre-hidden').length;

        if (hiddenCount > 0) {
            console.log(`[GetirFiltre] Processed ${cards.length} cards, hid ${hiddenCount}, total hidden: ${totalHiddenCount}`);
        }
    }

    sendBadgeUpdate();
}

// Debounced version
const debouncedRunFilter = debounce(runFilter, TIMING.DEBOUNCE_MS);

/**
 * Re-evaluate all processed cards when settings change
 * This allows instant show/hide when any filter value changes
 */
function reEvaluateAllCards(newSettings: UserSettings): void {
    // If extension is disabled, show all hidden cards
    if (!newSettings.isEnabled) {
        const hiddenCards = document.querySelectorAll<HTMLElement>(`.${CSS_CLASSES.HIDDEN}`);
        hiddenCards.forEach((el) => showCard(el));
        console.log(`[GetirFiltre] Disabled - showed ${hiddenCards.length} cards`);
        totalHiddenCount = 0;
        sendBadgeUpdate();
        return;
    }

    // Find all processed cards (including hidden ones)
    const processedCards = document.querySelectorAll<HTMLElement>(`.${CSS_CLASSES.PROCESSED}`);
    let showCount = 0;
    let hideCount = 0;

    processedCards.forEach((element) => {
        // Extract data from the card to check filters
        const link = element.querySelector<HTMLAnchorElement>('a[href*="/yemek/restoran/"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        const slugMatch = href.match(/\/yemek\/restoran\/([^/]+)\//);
        if (!slugMatch) return;

        const slug = slugMatch[1];

        // Check if this card should be hidden
        let shouldHide = false;

        // Check blocklist
        if (newSettings.blockedRestaurants.includes(slug)) {
            shouldHide = true;
        }

        // Check other filters by re-extracting data
        if (!shouldHide) {
            // Re-extract card data for filter checks
            const cardText = element.innerText || '';

            // Rating check
            if (newSettings.minRating !== null) {
                const ratingMatch = cardText.match(/(\d\.\d)\s*\(\d/);
                if (ratingMatch) {
                    const rating = parseFloat(ratingMatch[1]);
                    if (rating < newSettings.minRating) {
                        shouldHide = true;
                    }
                }
            }

            // Min basket check
            if (!shouldHide && newSettings.maxMinBasket !== null) {
                const minBasketMatch = cardText.match(/Min\.\s*₺?(\d+)/i);
                if (minBasketMatch) {
                    const minBasket = parseInt(minBasketMatch[1], 10);
                    if (minBasket > newSettings.maxMinBasket) {
                        shouldHide = true;
                    }
                }
            }

            // Distance check
            if (!shouldHide && newSettings.maxDistance !== null) {
                const distanceMatch = cardText.match(/(?:^|[\s\n])(\d+[,.]?\d*)\s*km/i);
                if (distanceMatch) {
                    const distance = parseFloat(distanceMatch[1].replace(',', '.'));
                    if (distance > newSettings.maxDistance) {
                        shouldHide = true;
                    }
                }
            }

            // Delivery time check
            if (!shouldHide && newSettings.maxDeliveryTime !== null) {
                const timeMatch = cardText.match(/(\d+)-?(\d+)?\s*dk/);
                if (timeMatch) {
                    // Use max time from range (e.g., "25-35 dk" -> 35)
                    const deliveryTime = timeMatch[2] ? parseInt(timeMatch[2], 10) : parseInt(timeMatch[1], 10);
                    if (deliveryTime > newSettings.maxDeliveryTime) {
                        shouldHide = true;
                    }
                }
            }

            // Review count check  
            if (!shouldHide && newSettings.minReviewCount !== null) {
                const reviewMatch = cardText.match(/\((\d+)\+?\)/);
                if (reviewMatch) {
                    const reviewCount = parseInt(reviewMatch[1], 10);
                    if (reviewCount < newSettings.minReviewCount) {
                        shouldHide = true;
                    }
                }
            }

            // Sponsored check
            if (!shouldHide && newSettings.hideSponsored) {
                if (cardText.includes('Sponsorlu')) {
                    shouldHide = true;
                }
            }

            // Promotions only check
            if (!shouldHide && newSettings.showOnlyPromotions) {
                if (!cardText.toLowerCase().includes('indirim') && !cardText.includes('ACIKTIYSAN')) {
                    shouldHide = true;
                }
            }
        }

        // Apply visibility change
        const isCurrentlyHidden = element.classList.contains(CSS_CLASSES.HIDDEN);

        if (shouldHide && !isCurrentlyHidden) {
            hideCard(element);
            hideCount++;
        } else if (!shouldHide && isCurrentlyHidden) {
            showCard(element);
            showCount++;
        }
    });

    if (showCount > 0 || hideCount > 0) {
        console.log(`[GetirFiltre] Re-evaluated: showed ${showCount}, hid ${hideCount} cards`);
    }

    // Update badge with current hidden count
    totalHiddenCount = document.querySelectorAll(`.${CSS_CLASSES.HIDDEN}`).length;
    sendBadgeUpdate();
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
 * Inject a block button on the restaurant detail page
 */
async function injectRestaurantPageBlockButton(): Promise<void> {
    // Check if already injected
    if (document.querySelector(`.${CSS_CLASSES.RESTAURANT_PAGE_BLOCK_BUTTON}`)) {
        return;
    }

    // Extract slug from URL
    const slugMatch = window.location.href.match(URL_PATTERNS.RESTAURANT_DETAIL);
    if (!slugMatch) return;

    const slug = slugMatch[1];

    // Find the restaurant name header - look for the main heading
    // Getir uses various selectors, try multiple approaches
    let headerContainer: HTMLElement | null = null;

    // Try to find the restaurant name element (usually a heading or prominent text)
    const possibleHeaders = document.querySelectorAll('h1, h2, [class*="RestaurantName"], [class*="restaurantName"]');
    for (const header of possibleHeaders) {
        if (header.textContent && header.textContent.length > 2 && header.textContent.length < 100) {
            headerContainer = header as HTMLElement;
            break;
        }
    }

    // Fallback: look for the area near the restaurant image
    if (!headerContainer) {
        const infoSection = document.querySelector('[class*="InfoSection"], [class*="RestaurantInfo"], article');
        if (infoSection) {
            const firstP = infoSection.querySelector('p, h1, h2, span');
            if (firstP && firstP.textContent && firstP.textContent.length > 2) {
                headerContainer = firstP as HTMLElement;
            }
        }
    }

    if (!headerContainer) {
        console.log('[GetirFiltre] Could not find restaurant header on detail page');
        return;
    }

    // Create button
    const button = document.createElement('button');
    button.className = CSS_CLASSES.RESTAURANT_PAGE_BLOCK_BUTTON;
    button.innerHTML = '×';
    button.title = 'Restoran Gizle (Block Restaurant)';
    button.setAttribute('aria-label', 'Block this restaurant');

    // Handle click
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        await storage.blockRestaurant(slug);

        // Visual feedback
        button.innerHTML = '✓';
        button.style.background = 'rgba(34, 197, 94, 0.9)';
        button.title = 'Blocked!';

        console.log(`[GetirFiltre] Blocked restaurant from detail page: ${slug}`);

        // Optional: redirect back after a short delay
        setTimeout(() => {
            window.history.back();
        }, 500);
    });

    // Insert button after the header
    headerContainer.style.display = 'inline-flex';
    headerContainer.style.alignItems = 'center';
    headerContainer.appendChild(button);

    console.log(`[GetirFiltre] Injected block button on restaurant page: ${slug}`);
}

/**
 * Initialize the content script
 */
async function init(): Promise<void> {
    const url = window.location.href;
    const isRestaurantsPage = URL_PATTERNS.RESTAURANTS_PAGE.test(url);
    const isRestaurantDetailPage = URL_PATTERNS.RESTAURANT_DETAIL.test(url);

    // Check if we're on a supported page
    if (!isRestaurantsPage && !isRestaurantDetailPage) {
        console.log('[GetirFiltre] Not on a supported page, skipping');
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

    // Handle restaurant detail page
    if (isRestaurantDetailPage) {
        // Wait a bit for the page to fully render
        setTimeout(() => {
            injectRestaurantPageBlockButton();
        }, 500);

        // Also observe for dynamic content loading
        const detailObserver = new MutationObserver(() => {
            injectRestaurantPageBlockButton();
        });
        detailObserver.observe(document.body, { childList: true, subtree: true });

        isInitialized = true;
        console.log('[GetirFiltre] Restaurant detail page ready! 🚀');
        return;
    }

    // Listen for settings changes (for listings page)
    storage.onSettingsChange((newSettings) => {
        console.log('[GetirFiltre] Settings updated:', newSettings);
        currentSettings = newSettings;

        // Handle section visibility immediately (Campaign/Müdavim/ACIKTIYSAN toggles)
        manageSectionVisibility(newSettings);

        // Re-evaluate all cards for instant show/hide
        reEvaluateAllCards(newSettings);
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
