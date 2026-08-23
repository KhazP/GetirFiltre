/**
 * Cross-platform constants.
 *
 * Site-specific selectors and text patterns live in the platform adapters
 * (src/content/platforms/), not here.
 */

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
    SETTINGS: 'getirfiltre_settings',
} as const;

/**
 * CSS class names for extension use
 */
export const CSS_CLASSES = {
    HIDDEN: 'getirfiltre-hidden',
    PROCESSED: 'getirfiltre-processed',
    BLOCK_BUTTON: 'getirfiltre-block-btn',
    BLOCK_BUTTON_CONTAINER: 'getirfiltre-btn-container',
    RESTAURANT_PAGE_BLOCK_BUTTON: 'getirfiltre-restaurant-page-btn',
} as const;

/**
 * Timing constants
 */
export const TIMING = {
    DEBOUNCE_MS: 300,
    UNDO_BUFFER_SIZE: 5,
} as const;
