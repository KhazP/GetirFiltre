import { RestaurantCard } from '../shared/types';
import { CSS_CLASSES } from '../shared/constants';
import { PlatformAdapter } from './platforms';

/**
 * Scan the page for restaurant cards through the active platform adapter.
 * Already processed cards are skipped unless `includeProcessed` is set.
 */
export function scanRestaurantCards(
    adapter: PlatformAdapter,
    includeProcessed = false
): RestaurantCard[] {
    const cards: RestaurantCard[] = [];

    let elements: HTMLElement[];
    try {
        elements = adapter.findCardElements();
    } catch (error) {
        console.warn('[GetirFiltre] Card lookup failed:', error);
        return cards;
    }

    elements.forEach((element) => {
        if (!includeProcessed && element.classList.contains(CSS_CLASSES.PROCESSED)) {
            return;
        }

        const card = extractRestaurantData(adapter, element);
        if (card) {
            cards.push(card);
        }
    });

    return cards;
}

/**
 * Parse a single card element. Never throws - a parse failure must not break
 * the host page.
 */
export function extractRestaurantData(
    adapter: PlatformAdapter,
    element: HTMLElement
): RestaurantCard | null {
    try {
        return adapter.extract(element);
    } catch (error) {
        console.warn('[GetirFiltre] Error extracting card data:', error);
        return null;
    }
}
