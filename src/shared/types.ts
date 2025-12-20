/**
 * User settings stored in chrome.storage
 */
export interface UserSettings {
    isEnabled: boolean;
    minRating: number | null;
    maxMinBasket: number | null;
    minReviewCount: number | null;
    maxDistance: number | null;
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
    distance: number | null; // in km
    isSponsored: boolean;
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
