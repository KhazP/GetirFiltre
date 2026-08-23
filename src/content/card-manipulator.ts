import { RestaurantCard, UndoAction, UserSettings } from '../shared/types';
import { CSS_CLASSES, TIMING } from '../shared/constants';
import { storage } from '../shared/storage';
import { PlatformAdapter } from './platforms';
import { sendTelemetryEvent } from '../shared/telemetry-events';

// Undo buffer for recent hides
const undoBuffer: UndoAction[] = [];

/**
 * Inject a block button onto a restaurant card
 */
export function injectBlockButton(card: RestaurantCard, adapter: PlatformAdapter): void {
    if (card.element.querySelector(`.${CSS_CLASSES.BLOCK_BUTTON_CONTAINER}`)) {
        return;
    }

    const container = document.createElement('div');
    container.className = CSS_CLASSES.BLOCK_BUTTON_CONTAINER;

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

    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        addToUndoBuffer({
            key: card.key,
            name: card.name,
            timestamp: Date.now(),
        });

        await storage.blockRestaurant(card.key, card.name);
        sendTelemetryEvent('ext_block_added');

        hideCard(card.hideTarget);

        // Search results also list the restaurant's menu items
        adapter.hideRelated?.(card.slug, hideCard);

        console.log(`[GetirFiltre] Blocked: ${card.name} (${card.key})`);
    });

    container.appendChild(button);

    card.element.style.position = 'relative';
    card.element.appendChild(container);
}

/**
 * Hide a card (using visual fade transition, then CSS class)
 */
export function hideCard(element: HTMLElement): void {
    if (element.classList.contains(CSS_CLASSES.HIDDEN)) return;

    element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    element.style.opacity = '1';
    element.style.transform = 'scale(1)';

    // Force reflow
    void element.offsetHeight;

    element.style.opacity = '0';
    element.style.transform = 'scale(0.95)';

    const onTransitionEnd = (e: TransitionEvent) => {
        if (e.propertyName === 'opacity') {
            element.classList.add(CSS_CLASSES.HIDDEN);
            element.style.removeProperty('transition');
            element.style.removeProperty('opacity');
            element.style.removeProperty('transform');
            element.removeEventListener('transitionend', onTransitionEnd);
        }
    };
    element.addEventListener('transitionend', onTransitionEnd);
}

/**
 * Show a previously hidden card
 */
export function showCard(element: HTMLElement): void {
    element.classList.remove(CSS_CLASSES.HIDDEN);
    element.style.removeProperty('transition');
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
}

/**
 * Mark a card as processed
 */
export function markProcessed(element: HTMLElement): void {
    element.classList.add(CSS_CLASSES.PROCESSED);
}

/**
 * The single filter decision. Every surface (first pass, re-evaluation after a
 * settings change) goes through this, so the rules cannot drift apart.
 */
export function shouldHideCard(card: RestaurantCard, settings: UserSettings): boolean {
    if (settings.blockedRestaurants.includes(card.key)) {
        return true;
    }

    if (settings.blockedKeywords?.length) {
        const haystack = `${card.name} ${card.promotions.join(' ')}`.toLowerCase();
        if (settings.blockedKeywords.some((keyword) => haystack.includes(keyword))) {
            return true;
        }
    }

    if (settings.minRating !== null && card.rating !== null && card.rating < settings.minRating) {
        return true;
    }

    if (settings.maxMinBasket !== null && card.minBasket !== null && card.minBasket > settings.maxMinBasket) {
        return true;
    }

    if (settings.minReviewCount !== null && card.reviewCount !== null && card.reviewCount < settings.minReviewCount) {
        return true;
    }

    if (settings.maxDistance !== null && card.distance !== null && card.distance > settings.maxDistance) {
        return true;
    }

    if (
        settings.maxDeliveryTime !== null &&
        card.deliveryTimeMinutes !== null &&
        card.deliveryTimeMinutes > settings.maxDeliveryTime
    ) {
        return true;
    }

    if (settings.showOnlyPromotions && card.promotions.length === 0) {
        return true;
    }

    if (settings.hideSponsored && card.isSponsored) {
        return true;
    }

    return false;
}

/**
 * Process cards: hide the ones that fail the filters, add a block button to the rest.
 * Returns how many cards were hidden.
 */
export function processCards(
    cards: RestaurantCard[],
    settings: UserSettings,
    adapter: PlatformAdapter
): number {
    let hiddenCount = 0;

    cards.forEach((card) => {
        markProcessed(card.element);

        if (shouldHideCard(card, settings)) {
            hideCard(card.hideTarget);
            hiddenCount++;
            return;
        }

        showCard(card.hideTarget);

        if (settings.isEnabled) {
            injectBlockButton(card, adapter);
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
        await storage.unblockRestaurant(action.key);
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
