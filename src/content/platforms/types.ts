import { PlatformId, RestaurantCard, UserSettings } from '../../shared/types';

/**
 * A platform adapter isolates every site-specific assumption (URL shapes,
 * card markup, text formats) behind one interface. The content script itself
 * stays site-agnostic.
 */
export interface PlatformAdapter {
    id: PlatformId;
    label: string;

    /** True when this adapter owns the given URL. */
    matches(url: string): boolean;

    /** Restaurant detail page -> platform-local id. Null on listing pages. */
    detailSlug(url: string): string | null;

    /** True when cards can appear on this URL (listing, search, home). */
    hasListings(url: string): boolean;

    /** Card roots currently in the DOM (processed ones included). */
    findCardElements(): HTMLElement[];

    /** Parse one card root. Returns null when the markup does not match. */
    extract(element: HTMLElement): RestaurantCard | null;

    /** Place the detail-page block button. Returns false when no anchor exists yet. */
    mountDetailButton(button: HTMLElement): boolean;

    /** Restaurant name on a detail page, for the blocklist display. */
    detailName(): string | null;

    /** Show/hide whole page sections (carousels, promo blocks). */
    applySectionVisibility(settings: UserSettings): void;

    /** Cheap test: could this added node contain restaurant cards? */
    isCardMutation(node: HTMLElement): boolean;

    /** Optional: hide extra nodes tied to a blocked restaurant (e.g. search hits). */
    hideRelated?(slug: string, hide: (element: HTMLElement) => void): void;

    /** Site-specific CSS appended to the injected stylesheet. */
    css: string;
}

/** Build the storage key for a restaurant. Getir keys stay bare for back-compat. */
export function storageKey(platform: PlatformId, slug: string): string {
    return platform === 'getir' ? slug : `${platform}:${slug}`;
}

/**
 * Walk up from a card root to the wrapper that should be hidden with it
 * (gradient borders, swiper slides). Stops as soon as a parent holds siblings.
 */
export function outermostWrapper(element: HTMLElement, maxDepth = 3): HTMLElement {
    let target = element;
    let parent = target.parentElement;
    let depth = 0;

    while (parent && parent !== document.body && parent.children.length === 1 && depth < maxDepth) {
        target = parent;
        parent = target.parentElement;
        depth++;
    }

    return target;
}
