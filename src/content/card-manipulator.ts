import { RestaurantCard, UndoAction, UserSettings } from '../shared/types';
import { CSS_CLASSES, TIMING } from '../shared/constants';
import { storage } from '../shared/storage';

// Undo buffer for recent hides
const undoBuffer: UndoAction[] = [];

/**
 * Inject a block button onto a restaurant card
 */
export function injectBlockButton(card: RestaurantCard): void {
    // Check if button already exists
    if (card.element.querySelector(`.${CSS_CLASSES.BLOCK_BUTTON_CONTAINER}`)) {
        return;
    }

    // Create button container
    const container = document.createElement('div');
    container.className = CSS_CLASSES.BLOCK_BUTTON_CONTAINER;

    // Create button
    const button = document.createElement('button');
    button.className = CSS_CLASSES.BLOCK_BUTTON;
    button.innerHTML = '×';
    button.title = 'Gizle (Hide)';
    button.setAttribute('aria-label', `Hide ${card.name}`);

    // Prevent event from reaching parent anchor
    button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }, true);

    button.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
    }, { capture: true, passive: false });

    // Handle click
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Add to undo buffer
        addToUndoBuffer({
            slug: card.slug,
            name: card.name,
            timestamp: Date.now(),
        });

        // Block in storage
        await storage.blockRestaurant(card.slug);

        // Hide immediately
        hideCard(card.element);

        // Also hide any related menu items in search results
        hideRelatedItems(card.slug);

        console.log(`[GetirFiltre] Blocked: ${card.name} (${card.slug})`);
    });

    container.appendChild(button);

    // Position container
    card.element.style.position = 'relative';
    card.element.appendChild(container);
}

/**
 * Hide all related items (menu items) in search results that belong to the same restaurant
 * Menu items appear as sibling elements after the restaurant card in search results
 */
function hideRelatedItems(slug: string): void {
    // Find the restaurant card link with this slug
    const restaurantLink = document.querySelector<HTMLAnchorElement>(
        `a[href*="/yemek/restoran/${slug}/"]`
    );

    if (!restaurantLink) return;

    // Find the outermost container (the anchor wrapper or its parent)
    let container: HTMLElement | null = restaurantLink;

    // Walk up to find the main search result container
    while (container && container.parentElement) {
        // Check if we're at a level where siblings are other search results
        const parent: HTMLElement = container.parentElement;
        const siblings = parent.children;

        // If parent has multiple children that look like search result items, we're at the right level
        let foundLevel = false;
        for (const sibling of siblings) {
            if (sibling !== container && (
                sibling.querySelector('article[type="list-view-with-image"]') ||
                sibling.classList.contains('sc-f5b1a14a-2') // Menu item class
            )) {
                foundLevel = true;
                break;
            }
        }

        if (foundLevel) {
            // Now hide all following siblings that are menu items (not restaurant cards)
            let nextSibling = container.nextElementSibling as HTMLElement | null;

            while (nextSibling) {
                // Check if this is another restaurant card - stop if so
                if (nextSibling.querySelector('article[type="list-view-with-image"]') ||
                    nextSibling.querySelector('a[href*="/yemek/restoran/"]')) {
                    break;
                }

                // This looks like a menu item - hide it
                hideCard(nextSibling);
                nextSibling = nextSibling.nextElementSibling as HTMLElement | null;
            }
            break;
        }

        container = parent;
    }
}

/**
 * Hide a card (using CSS class for easy reversal)
 */
export function hideCard(element: HTMLElement): void {
    element.classList.add(CSS_CLASSES.HIDDEN);
}

/**
 * Show a previously hidden card
 */
export function showCard(element: HTMLElement): void {
    element.classList.remove(CSS_CLASSES.HIDDEN);
}

/**
 * Mark a card as processed
 */
export function markProcessed(element: HTMLElement): void {
    element.classList.add(CSS_CLASSES.PROCESSED);
}

/**
 * Process all cards: hide blocked, inject buttons, apply filters
 */
export function processCards(cards: RestaurantCard[], settings: UserSettings): number {
    let hiddenCount = 0;

    cards.forEach((card) => {
        // Mark as processed first
        markProcessed(card.element);

        // Check if blocked
        if (settings.blockedRestaurants.includes(card.slug)) {
            hideCard(card.element);
            hiddenCount++;
            return;
        }

        // Apply rating filter (only if card has rating and filter is set)
        if (settings.minRating !== null && card.rating !== null) {
            if (card.rating < settings.minRating) {
                hideCard(card.element);
                hiddenCount++;
                return;
            }
        }

        // Apply min basket filter
        if (settings.maxMinBasket !== null && card.minBasket !== null) {
            if (card.minBasket > settings.maxMinBasket) {
                hideCard(card.element);
                hiddenCount++;
                return;
            }
        }

        // Apply review count filter
        if (settings.minReviewCount !== null && card.reviewCount !== null) {
            if (card.reviewCount < settings.minReviewCount) {
                hideCard(card.element);
                hiddenCount++;
                return;
            }
        }

        // Apply distance filter
        if (settings.maxDistance !== null && card.distance !== null) {
            if (card.distance > settings.maxDistance) {
                hideCard(card.element);
                hiddenCount++;
                return;
            }
        }

        // Card passed filters - inject block button
        if (settings.isEnabled) {
            injectBlockButton(card);
        }
    });

    return hiddenCount;
}

/**
 * Add to undo buffer (keeps last N items)
 */
function addToUndoBuffer(action: UndoAction): void {
    undoBuffer.unshift(action);
    while (undoBuffer.length > TIMING.UNDO_BUFFER_SIZE) {
        undoBuffer.pop();
    }
}

/**
 * Get the last blocked restaurant (for undo)
 */
export function getLastBlocked(): UndoAction | null {
    return undoBuffer[0] || null;
}

/**
 * Undo last block action
 */
export async function undoLastBlock(): Promise<UndoAction | null> {
    const action = undoBuffer.shift();
    if (action) {
        await storage.unblockRestaurant(action.slug);
        return action;
    }
    return null;
}

/**
 * Get undo buffer (for debugging/display)
 */
export function getUndoBuffer(): UndoAction[] {
    return [...undoBuffer];
}
