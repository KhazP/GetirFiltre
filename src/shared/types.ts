/**
 * Supported delivery platforms
 */
export type PlatformId = 'getir' | 'tgo';

/**
 * User settings stored in chrome.storage
 */
export interface UserSettings {
    isEnabled: boolean;
    minRating: number | null;
    maxMinBasket: number | null;
    minReviewCount: number | null;
    maxDistance: number | null;
    maxDeliveryTime: number | null; // in minutes
    showOnlyPromotions: boolean; // show only restaurants with active deals
    hideSponsored: boolean; // hide sponsored restaurants
    // Section visibility
    hideCampaignCarousel: boolean; // hide top campaign carousel
    hideMudavimSection: boolean; // hide "GetirYemek Müdavim" section
    hideAciktiysanSection: boolean; // hide "ACIKTIYSAN" promotion section
    blockedRestaurants: string[]; // Array of storage keys (see RestaurantCard.key)
    blockedNames: Record<string, string>; // storage key -> display name
    blockedKeywords: string[]; // Array of lowercase keywords to block
}

/**
 * Restaurant data extracted from DOM
 */
export interface RestaurantCard {
    element: HTMLElement; // card root: marked as processed, hosts the block button
    hideTarget: HTMLElement; // element to hide (wrapper, may equal element)
    platform: PlatformId;
    slug: string; // platform-local id ("kfc-atasehir" or "1833")
    key: string; // storage key: bare slug on Getir (legacy), "tgo:1833" elsewhere
    name: string;
    rating: number | null; // null if no rating (new restaurant)
    reviewCount: number | null; // null if no reviews yet
    minBasket: number | null;
    deliveryTime: string | null;
    deliveryTimeMinutes: number | null; // parsed max delivery time in minutes
    distance: number | null; // in km
    isSponsored: boolean;
    promotions: string[]; // Array of promotion labels (e.g., "Ücretsiz Teslimat")
}

/**
 * Default settings for new users
 */
export const DEFAULT_SETTINGS: UserSettings = {
    isEnabled: true,
    minRating: null,
    maxMinBasket: null,
    minReviewCount: null,
    maxDistance: null,
    maxDeliveryTime: null,
    showOnlyPromotions: false,
    hideSponsored: false,
    hideCampaignCarousel: false,
    hideMudavimSection: false,
    hideAciktiysanSection: false,
    blockedRestaurants: [],
    blockedNames: {},
    blockedKeywords: [],
};

/**
 * Undo action for recent hides
 */
export interface UndoAction {
    key: string;
    name: string;
    timestamp: number;
}
