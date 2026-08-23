import { UserSettings } from '../../shared/types';
import { PLATFORMS } from '../../shared/platforms';
import { PlatformAdapter, outermostWrapper, storageKey } from './types';

/**
 * Uber Eats Trendyol Go (tgoyemek.com)
 *
 * This site tags every card field with a duplicated `id` attribute
 * (`#distance`, `#min-basket-price`, ...). Ids repeat across cards, so always
 * query them inside the card element, never with getElementById.
 */

const CARD_LINK = 'a[href*="/restoranlar/"]';
const CARD_CONTENT = '[id="restaurant-card-large-content"]';
const PROMOTIONS = '[id="restaurant-card-large-promotions"]';
const DELIVERY_TYPE = '[id="delivery-type"]';
const DISTANCE = '[id="distance"]';
const MIN_BASKET = '[id="min-basket-price"]';

const DETAIL_URL = /\/restoranlar\/(\d+)/;
const RATING_BADGE = /^(\d(?:[.,]\d)?)\s*\((\d[\d.,]*)\+?\)$/;

/** Overlay badges that mark quality, not a deal. */
const QUALITY_BADGE_IDS = [
    'restaurant-card-large-gourme-badge',
    'restaurant-card-large-district-star-badge',
];

const css = `
/* The promotion badges sit top-left, so the block button goes top-right */
a[href*="/restoranlar/"] .getirfiltre-btn-container {
  left: auto;
  right: 8px;
}

a[href*="/restoranlar/"]:hover .getirfiltre-btn-container {
  opacity: 1;
}
`;

export const tgoAdapter: PlatformAdapter = {
    id: 'tgo',
    label: PLATFORMS.tgo.site,
    css,

    matches(url) {
        return PLATFORMS.tgo.hostPattern.test(url);
    },

    detailSlug(url) {
        return new URL(url, location.origin).pathname.match(DETAIL_URL)?.[1] ?? null;
    },

    hasListings(url) {
        // Cards show up on the home page, /restoranlar and /arama alike
        return this.detailSlug(url) === null;
    },

    findCardElements() {
        return Array.from(document.querySelectorAll<HTMLElement>(CARD_LINK)).filter(
            (link) => DETAIL_URL.test(link.getAttribute('href') || '') && link.querySelector(CARD_CONTENT)
        );
    },

    extract(element) {
        const slug = element.getAttribute('href')?.match(DETAIL_URL)?.[1];
        if (!slug) {
            return null;
        }

        const content = element.querySelector<HTMLElement>(CARD_CONTENT);
        const titleRow = content?.firstElementChild ?? null;

        const name =
            element.getAttribute('title')?.trim() ||
            titleRow?.querySelector('div[class*="title-3"]')?.textContent?.trim() ||
            'Bilinmeyen Restoran';

        const { rating, reviewCount } = extractRatingAndReviews(titleRow);
        const deliveryTime = extractDeliveryTime(element);

        return {
            element,
            hideTarget: outermostWrapper(element),
            platform: 'tgo',
            slug,
            key: storageKey('tgo', slug),
            name,
            rating,
            reviewCount,
            minBasket: extractMinBasket(element),
            deliveryTime,
            deliveryTimeMinutes: parseDeliveryMinutes(deliveryTime),
            distance: extractDistance(element),
            isSponsored: isSponsored(titleRow),
            promotions: extractPromotions(element),
        };
    },

    detailName() {
        return document.querySelector('h1')?.textContent?.trim() || null;
    },

    mountDetailButton(button) {
        const heading = document.querySelector<HTMLElement>('h1');
        if (!heading?.textContent?.trim()) {
            return false;
        }

        (heading.parentElement ?? heading).appendChild(button);
        return true;
    },

    applySectionVisibility(settings: UserSettings) {
        // "Kampanyalar (37)" carousel above the restaurant grid
        const heading = Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3')).find((h) =>
            /^Kampanyalar\s*\(/.test(h.textContent?.trim() || '')
        );

        const section = heading ? sectionOf(heading) : null;
        if (section) {
            section.style.display = settings.hideCampaignCarousel ? 'none' : '';
        }
    },

    isCardMutation(node) {
        return node.matches?.(CARD_LINK) || !!node.querySelector?.(CARD_LINK);
    },
};

/** The wrapper that holds a heading and its carousel, without swallowing the page. */
function sectionOf(heading: HTMLElement): HTMLElement | null {
    const section = heading.closest('section');
    // The main restaurant grid lives under an <h1>; never hide that one
    if (section && !section.querySelector('h1')) {
        return section;
    }
    return heading.parentElement;
}

function extractRatingAndReviews(titleRow: Element | null): {
    rating: number | null;
    reviewCount: number | null;
} {
    // Cards without a rating start the row with the name instead of the badge
    const badgeText = titleRow?.firstElementChild?.textContent?.trim() || '';
    const match = badgeText.match(RATING_BADGE);
    if (!match) {
        return { rating: null, reviewCount: null };
    }

    const rating = parseFloat(match[1].replace(',', '.'));
    const reviewCount = parseInt(match[2].replace(/[.,]/g, ''), 10);

    if (rating < 1 || rating > 5) {
        return { rating: null, reviewCount: null };
    }

    return { rating, reviewCount: Number.isNaN(reviewCount) ? null : reviewCount };
}

/**
 * "4.2km" -> 4.2. Sub-kilometre distances render as "0.5m" on this site, so a
 * small "m" value is still kilometres; a large one is real metres.
 */
function extractDistance(element: HTMLElement): number | null {
    const text = element.querySelector<HTMLElement>(DISTANCE)?.textContent?.trim() || element.innerText || '';
    const match = text.match(/(\d+(?:[.,]\d+)?)\s*(km|m)\b/i);
    if (!match) return null;

    const value = parseFloat(match[1].replace(',', '.'));
    if (Number.isNaN(value)) return null;

    const km = match[2].toLowerCase() === 'm' && value >= 10 ? value / 1000 : value;
    return km >= 0 && km <= 50 ? km : null;
}

/** "Min. 2.000 TL" -> 2000 (dot is a thousands separator here) */
function extractMinBasket(element: HTMLElement): number | null {
    const text = element.querySelector<HTMLElement>(MIN_BASKET)?.textContent || element.innerText || '';
    const match = text.match(/Min\.\s*(?:₺\s*)?([\d.]+)/i);
    if (!match) return null;

    const value = parseInt(match[1].replace(/\./g, ''), 10);
    return value > 0 && value <= 20000 ? value : null;
}

/** "30-40dk" */
function extractDeliveryTime(element: HTMLElement): string | null {
    const text = element.querySelector<HTMLElement>(DELIVERY_TYPE)?.innerText || element.innerText || '';
    const match = text.match(/(\d+\s*(?:-\s*\d+)?)\s*dk/i);
    return match ? `${match[1].replace(/\s+/g, '')} dk` : null;
}

function isSponsored(titleRow: Element | null): boolean {
    if (!titleRow) return false;
    return Array.from(titleRow.children).some((child) => child.textContent?.trim() === 'Sponsorlu');
}

/** Overlay badge lines, minus the quality badges. */
function extractPromotions(element: HTMLElement): string[] {
    const overlay = element.querySelector<HTMLElement>(PROMOTIONS);
    if (!overlay) return [];

    return Array.from(overlay.children)
        .filter((badge) => !QUALITY_BADGE_IDS.includes(badge.id))
        .map((badge) => (badge as HTMLElement).innerText.trim())
        .filter(Boolean);
}

/** "25-35 dk" -> 35, "30 dk" -> 30 */
function parseDeliveryMinutes(deliveryTime: string | null): number | null {
    if (!deliveryTime) return null;

    const range = deliveryTime.match(/(\d+)\s*-\s*(\d+)/);
    if (range) {
        return parseInt(range[2], 10);
    }

    const single = deliveryTime.match(/(\d+)/);
    return single ? parseInt(single[1], 10) : null;
}
