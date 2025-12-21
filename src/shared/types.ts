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
    blockedRestaurants: string[]; // Array of slugs
}

/**
 * Restaurant data extracted from DOM
 */
export interface RestaurantCard {
    element: HTMLElement;
    slug: string;
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
    blockedRestaurants: [],
};

/**
 * Undo action for recent hides
 */
export interface UndoAction {
    slug: string;
    name: string;
    timestamp: number;
}
