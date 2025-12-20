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

    // Handle click
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

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

        console.log(`[GetirFiltre] Blocked: ${card.name} (${card.slug})`);
    });

    container.appendChild(button);

    // Position container
    card.element.style.position = 'relative';
    card.element.appendChild(container);
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
