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

        // Extract rating and review count
        const { rating, reviewCount } = extractRatingAndReviews(element);

        // Extract min basket price
        const minBasket = extractMinBasket(element);

        // Extract delivery time
        const deliveryTime = extractDeliveryTime(element);

        // Extract distance
        const distance = extractDistance(element);

        // Check if sponsored
        const isSponsored = element.textContent?.includes('Sponsorlu') || false;

        return {
            element,
            slug,
            name,
            rating,
            reviewCount,
            minBasket,
            deliveryTime,
            distance,
            isSponsored,
        };
    } catch (error) {
        console.error('[GetirFiltre] Error extracting card data:', error);
        return null;
    }
}

/**
 * Extract rating and review count from card
 * Returns null for each if not found (new restaurant)
 */
function extractRatingAndReviews(element: HTMLElement): { rating: number | null; reviewCount: number | null } {
    const text = element.textContent || '';

    // Try to match "4.6 (9000+)" format first
    const match = text.match(PARSE_PATTERNS.RATING_WITH_REVIEWS);
    if (match) {
        const rating = parseFloat(match[1]);
        const reviewCount = parseInt(match[2], 10);

        // Sanity check: ratings should be between 1-5
        if (rating >= 1 && rating <= 5) {
            return { rating, reviewCount };
        }
    }

    // Fallback: try old method for rating only
    const wrappers = element.querySelectorAll(SELECTORS.RATING_WRAPPER);
    for (const wrapper of wrappers) {
        const wrapperText = wrapper.textContent?.trim() || '';
        const words = wrapperText.split(/\s+/);
        for (const word of words) {
            const ratingMatch = word.match(PARSE_PATTERNS.RATING);
            if (ratingMatch) {
                const rating = parseFloat(ratingMatch[1]);
                if (rating >= 1 && rating <= 5) {
                    return { rating, reviewCount: null };
                }
            }
        }
    }

    return { rating: null, reviewCount: null };
}

/**
 * Extract distance from card
 * Returns distance in km, null if not found
 * Handles Turkish locale (comma as decimal separator)
 * Uses innerText to preserve whitespace between DOM elements
 */
function extractDistance(element: HTMLElement): number | null {
    // Use innerText instead of textContent - it preserves whitespace between elements
    const text = element.innerText || '';

    // Look for standalone distance pattern: space/newline before the number
    // This avoids matching concatenated price+distance like "₺1500.7 km"
    const match = text.match(/(?:^|[\s\n])(\d+[,.]?\d*)\s*km/i);

    if (match) {
        // Replace comma with dot for Turkish locale support
        const normalized = match[1].replace(',', '.');
        const distance = parseFloat(normalized);
        // Sanity check: distance should be reasonable (0-50 km)
        if (distance >= 0 && distance <= 50) {
            return distance;
        }
    }

    return null;
}

/**
 * Extract minimum basket price
 * Uses innerText to preserve whitespace between elements
 */
function extractMinBasket(element: HTMLElement): number | null {
    // Use innerText instead of textContent
    const text = element.innerText || '';

    // Look for "Min. ₺XXX" pattern - use a more specific regex
    // that expects a space/newline after the number (before "km" or other text)
    const match = text.match(/Min\.\s*₺?(\d+)(?=\s|$|[^\d])/i);

    if (match) {
        const value = parseInt(match[1], 10);
        // Sanity check: basket limits are typically 0-2000₺
        if (value > 0 && value <= 2000) {
            return value;
        }
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
