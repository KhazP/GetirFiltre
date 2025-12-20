/**
 * User settings stored in chrome.storage
 */
export interface UserSettings {
    isEnabled: boolean;
    minRating: number | null;
    maxMinBasket: number | null;
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
    minBasket: number | null;
    deliveryTime: string | null;
    isSponsored: boolean;
}

/**
 * Default settings for new users
 */
export const DEFAULT_SETTINGS: UserSettings = {
    isEnabled: true,
    minRating: null,
    maxMinBasket: null,
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
