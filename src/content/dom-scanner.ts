import { RestaurantCard } from '../shared/types';
import { SELECTORS, URL_PATTERNS, PARSE_PATTERNS, CSS_CLASSES } from '../shared/constants';

/**
 * Scan the DOM for restaurant cards
 * Uses fallback chain if primary selector fails
 */
export function scanRestaurantCards(): RestaurantCard[] {
    const cards: RestaurantCard[] = [];

    // Try primary selector first
    let elements = document.querySelectorAll<HTMLElement>(SELECTORS.RESTAURANT_CARD);

    // Fallback: find by restaurant links and traverse up
    if (elements.length === 0) {
        console.warn('[GetirFiltre] Primary selector failed, using fallback');
        elements = findCardsByLinks();
    }

    elements.forEach((element) => {
        // Skip already processed cards
        if (element.classList.contains(CSS_CLASSES.PROCESSED)) {
            return;
        }

        const card = extractRestaurantData(element);
        if (card) {
            cards.push(card);
        }
    });

    return cards;
}

/**
 * Fallback: Find cards by restaurant links and traverse up
 */
function findCardsByLinks(): NodeListOf<HTMLElement> {
    const links = document.querySelectorAll<HTMLAnchorElement>(SELECTORS.RESTAURANT_LINK);
    const cardElements = new Set<HTMLElement>();

    links.forEach((link) => {
        // Traverse up to find the article container
        let parent: HTMLElement | null = link.parentElement;
        let depth = 0;
        const maxDepth = 5;

        while (parent && depth < maxDepth) {
            if (parent.tagName === 'ARTICLE') {
                cardElements.add(parent);
                break;
            }
            parent = parent.parentElement;
            depth++;
        }
    });

    // Convert Set to NodeList-like object
    const tempDiv = document.createElement('div');
    cardElements.forEach((el) => tempDiv.appendChild(el.cloneNode(false)));

    // Return original elements
    return Array.from(cardElements) as unknown as NodeListOf<HTMLElement>;
}

/**
 * Extract restaurant data from a card element
 */
export function extractRestaurantData(element: HTMLElement): RestaurantCard | null {
    try {
        // Find the restaurant link to get the slug
        const link = element.querySelector<HTMLAnchorElement>(SELECTORS.RESTAURANT_LINK);
        if (!link) {
            return null;
        }

        const href = link.getAttribute('href');
        if (!href) {
            return null;
        }

        // Extract slug from URL
        const slugMatch = href.match(URL_PATTERNS.RESTAURANT_DETAIL);
        if (!slugMatch) {
            return null;
        }
        const slug = slugMatch[1];

        // Extract name (first <p> tag)
        const nameElement = element.querySelector<HTMLParagraphElement>(SELECTORS.RESTAURANT_NAME);
        const name = nameElement?.textContent?.trim() || 'Unknown Restaurant';

        // Extract rating
        const rating = extractRating(element);

        // Extract min basket price
        const minBasket = extractMinBasket(element);

        // Extract delivery time
        const deliveryTime = extractDeliveryTime(element);

        // Check if sponsored
        const isSponsored = element.textContent?.includes('Sponsorlu') || false;

        return {
            element,
            slug,
            name,
            rating,
            minBasket,
            deliveryTime,
            isSponsored,
        };
    } catch (error) {
        console.error('[GetirFiltre] Error extracting card data:', error);
        return null;
    }
}

/**
 * Extract rating from card
 * Returns null if no rating (new restaurant)
 */
function extractRating(element: HTMLElement): number | null {
    // Look for LabelWrapper elements
    const wrappers = element.querySelectorAll(SELECTORS.RATING_WRAPPER);

    for (const wrapper of wrappers) {
        const text = wrapper.textContent?.trim() || '';

        // Extract just the rating number (e.g., "4.5" from "4.5 (9000+)")
        const words = text.split(/\s+/);
        for (const word of words) {
            const match = word.match(PARSE_PATTERNS.RATING);
            if (match) {
                const rating = parseFloat(match[1]);
                // Sanity check: ratings should be between 1-5
                if (rating >= 1 && rating <= 5) {
                    return rating;
                }
            }
        }
    }

    return null;
}

/**
 * Extract minimum basket price
 */
function extractMinBasket(element: HTMLElement): number | null {
    const text = element.textContent || '';
    const match = text.match(PARSE_PATTERNS.MIN_BASKET);

    if (match) {
        return parseInt(match[1], 10);
    }

    return null;
}

/**
 * Extract delivery time
 */
function extractDeliveryTime(element: HTMLElement): string | null {
    // Try dedicated <time> element first
    const timeElement = element.querySelector<HTMLTimeElement>(SELECTORS.DELIVERY_TIME);
    if (timeElement) {
        return timeElement.textContent?.trim() || null;
    }

    // Fallback: regex match
    const text = element.textContent || '';
    const match = text.match(PARSE_PATTERNS.DELIVERY_TIME);

    if (match) {
        return `${match[1]} dk`;
    }

    return null;
}
