import { UserSettings } from '../../shared/types';
import { PLATFORMS } from '../../shared/platforms';
import { PlatformAdapter, storageKey } from './types';

/**
 * GetirYemek (getir.com/yemek)
 *
 * Class names are obfuscated hashes here, so everything below matches on
 * structure, attributes or text instead.
 */

const CARD = 'article[type="list-view-with-image"]';
const CARD_LINK = 'a[href*="/yemek/restoran/"]';
const RATING_WRAPPER = 'div[class*="LabelWrapper"]';

const DETAIL_URL = /\/yemek\/restoran\/([^/]+)\//;
const RATING = /^(\d[,.]\d)$/;
const RATING_WITH_REVIEWS = /(\d+[,.]\d+)\s*\(([\d.,]+)\+?\)/;

const css = `
article:hover .getirfiltre-btn-container,
[class*="restaurant"]:hover .getirfiltre-btn-container,
[class*="Restaurant"]:hover .getirfiltre-btn-container {
  opacity: 1;
}
`;

export const getirAdapter: PlatformAdapter = {
    id: 'getir',
    label: PLATFORMS.getir.site,
    css,

    matches(url) {
        return PLATFORMS.getir.hostPattern.test(url);
    },

    detailSlug(url) {
        return url.match(DETAIL_URL)?.[1] ?? null;
    },

    hasListings(url) {
        return this.detailSlug(url) === null;
    },

    findCardElements() {
        const primary = Array.from(document.querySelectorAll<HTMLElement>(CARD));
        if (primary.length > 0) {
            return primary;
        }

        // Fallback: find cards through their links and traverse up
        const cards = new Set<HTMLElement>();
        document.querySelectorAll<HTMLAnchorElement>(CARD_LINK).forEach((link) => {
            const article = link.closest('article');
            if (article instanceof HTMLElement) {
                cards.add(article);
            }
        });
        return Array.from(cards);
    },

    extract(element) {
        const href = element.querySelector<HTMLAnchorElement>(CARD_LINK)?.getAttribute('href');
        const slug = href?.match(DETAIL_URL)?.[1];
        if (!slug) {
            return null;
        }

        const name = element.querySelector('p')?.textContent?.trim() || 'Bilinmeyen Restoran';
        const { rating, reviewCount } = extractRatingAndReviews(element);
        const deliveryTime = extractDeliveryTime(element);

        return {
            element,
            hideTarget: element,
            platform: 'getir',
            slug,
            key: storageKey('getir', slug),
            name,
            rating,
            reviewCount,
            minBasket: extractMinBasket(element),
            deliveryTime,
            deliveryTimeMinutes: parseDeliveryMinutes(deliveryTime),
            distance: extractDistance(element),
            isSponsored: isSponsored(element),
            promotions: extractPromotions(element),
        };
    },

    detailName() {
        return detailHeader()?.textContent?.trim() || null;
    },

    mountDetailButton(button) {
        const header = detailHeader();
        if (!header) {
            return false;
        }

        header.style.display = 'inline-flex';
        header.style.alignItems = 'center';
        header.appendChild(button);
        return true;
    },

    applySectionVisibility(settings: UserSettings) {
        // Top campaign carousel: the first carousel that is not inside a card
        const topCarousel = document.querySelector<HTMLElement>('div[data-testid="carousel"]');
        if (topCarousel && !topCarousel.closest('div[data-testid="card"]')) {
            topCarousel.style.display = settings.hideCampaignCarousel ? 'none' : '';
        }

        document.querySelectorAll<HTMLElement>('div[data-testid="card"]').forEach((card) => {
            const title = card.querySelector('h5[data-testid="title"]')?.textContent || '';

            if (title.includes('Müdavim')) {
                card.style.display = settings.hideMudavimSection ? 'none' : '';
            } else if (title.includes('ACIKTIYSAN')) {
                card.style.display = settings.hideAciktiysanSection ? 'none' : '';
            }
        });
    },

    isCardMutation(node) {
        return node.tagName === 'ARTICLE' || !!node.querySelector?.('article');
    },

    /**
     * Search results list a restaurant card followed by its menu items.
     * Hide those siblings too, otherwise a blocked restaurant keeps showing up.
     */
    hideRelated(slug, hide) {
        const link = document.querySelector<HTMLAnchorElement>(`a[href*="/yemek/restoran/${slug}/"]`);
        if (!link) return;

        let container: HTMLElement | null = link;

        while (container && container.parentElement) {
            const siblings = Array.from(container.parentElement.children);

            const isResultLevel = siblings.some((sibling) =>
                sibling !== container && (
                    sibling.querySelector(CARD) ||
                    (!sibling.querySelector(CARD_LINK) && (
                        sibling.querySelector('[class*="Price"], [class*="price"]') ||
                        sibling.textContent?.includes('₺')
                    ))
                )
            );

            if (isResultLevel) {
                let sibling = container.nextElementSibling as HTMLElement | null;
                while (sibling) {
                    if (sibling.querySelector(CARD) || sibling.querySelector(CARD_LINK)) {
                        break; // next restaurant starts here
                    }
                    hide(sibling);
                    sibling = sibling.nextElementSibling as HTMLElement | null;
                }
                return;
            }

            container = container.parentElement;
        }
    },
};

/** The restaurant name element on a detail page. */
function detailHeader(): HTMLElement | null {
    const candidates = document.querySelectorAll<HTMLElement>(
        'h1, h2, [class*="RestaurantName"], [class*="restaurantName"]'
    );
    for (const candidate of candidates) {
        const text = candidate.textContent?.trim() || '';
        if (text.length > 2 && text.length < 100) {
            return candidate;
        }
    }

    const info = document.querySelector('[class*="InfoSection"], [class*="RestaurantInfo"], article');
    const first = info?.querySelector<HTMLElement>('p, h1, h2, span');
    if (first && (first.textContent?.trim().length || 0) > 2) {
        return first;
    }

    return null;
}

function extractRatingAndReviews(element: HTMLElement): { rating: number | null; reviewCount: number | null } {
    const text = element.textContent || '';

    const match = text.match(RATING_WITH_REVIEWS);
    if (match) {
        const rating = parseFloat(match[1].replace(',', '.'));
        const reviewCount = parseInt(match[2].replace(/[.,]/g, ''), 10);
        if (rating >= 1 && rating <= 5) {
            return { rating, reviewCount };
        }
    }

    // Fallback: rating only, inside a label wrapper
    for (const wrapper of element.querySelectorAll(RATING_WRAPPER)) {
        for (const word of (wrapper.textContent?.trim() || '').split(/\s+/)) {
            const ratingMatch = word.match(RATING);
            if (ratingMatch) {
                const rating = parseFloat(ratingMatch[1].replace(',', '.'));
                if (rating >= 1 && rating <= 5) {
                    return { rating, reviewCount: null };
                }
            }
        }
    }

    return { rating: null, reviewCount: null };
}

function extractDistance(element: HTMLElement): number | null {
    // innerText keeps the whitespace between elements, so "₺1500.7 km" cannot
    // be misread as a distance.
    const match = (element.innerText || '').match(/(?:^|[\s\n])(\d+[,.]?\d*)\s*km/i);
    if (!match) return null;

    const distance = parseFloat(match[1].replace(',', '.'));
    return distance >= 0 && distance <= 50 ? distance : null;
}

function extractMinBasket(element: HTMLElement): number | null {
    const match = (element.innerText || '').match(/Min\.\s*₺?(\d+)(?=\s|$|[^\d])/i);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    return value > 0 && value <= 5000 ? value : null;
}

function extractDeliveryTime(element: HTMLElement): string | null {
    const timeElement = element.querySelector<HTMLTimeElement>('time');
    if (timeElement) {
        return timeElement.textContent?.trim() || null;
    }

    const match = (element.textContent || '').match(/(\d+(?:-\d+)?)\s*dk/);
    return match ? `${match[1]} dk` : null;
}

function isSponsored(element: HTMLElement): boolean {
    for (const div of element.querySelectorAll('div')) {
        if (
            div.childNodes.length === 1 &&
            div.childNodes[0].nodeType === Node.TEXT_NODE &&
            div.textContent?.trim() === 'Sponsorlu'
        ) {
            return true;
        }
    }
    return false;
}

function extractPromotions(element: HTMLElement): string[] {
    const text = element.innerText || '';
    const promotions = new Set<string>();

    (text.match(/[^\n]*indirim[^\n]*/gi) || []).forEach((line) => {
        const cleaned = line.trim();
        if (cleaned) promotions.add(cleaned);
    });

    (text.match(/ACIKTIYSAN\d*/gi) || []).forEach((code) => promotions.add(code));

    return Array.from(promotions);
}

/** "25-35 dk" -> 35, "30 dk" -> 30 */
export function parseDeliveryMinutes(deliveryTime: string | null): number | null {
    if (!deliveryTime) return null;

    const range = deliveryTime.match(/(\d+)\s*-\s*(\d+)/);
    if (range) {
        return parseInt(range[2], 10);
    }

    const single = deliveryTime.match(/(\d+)/);
    return single ? parseInt(single[1], 10) : null;
}
