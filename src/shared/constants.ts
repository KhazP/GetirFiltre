/**
 * DOM Selectors - v1: tested 2024-12-21
 * Fallback chain for resilience against UI updates
 */
export const SELECTORS = {
    // Primary: Custom Getir attribute (stable)
    RESTAURANT_CARD: 'article[type="list-view-with-image"]',

    // Fallback: Find by restaurant link and traverse up
    RESTAURANT_LINK: 'a[href*="/yemek/restoran/"]',

    // Data extraction
    RESTAURANT_NAME: 'p',
    DELIVERY_TIME: 'time',
    RATING_WRAPPER: 'div[class*="LabelWrapper"]',
} as const;

/**
 * URL patterns
 */
export const URL_PATTERNS = {
    RESTAURANT_DETAIL: /\/yemek\/restoran\/([^/]+)\//,
    RESTAURANTS_PAGE: /getir\.com\/yemek\/restoranlar/,
} as const;

/**
 * Regex patterns for parsing card data
 */
export const PARSE_PATTERNS = {
    // Rating: exactly X.X format (not distance like 6.2 km)
    RATING: /^(\d\.\d)$/,

    // Rating with review count: "4.6 (9000+)" or "4.3 (200+)"
    RATING_WITH_REVIEWS: /(\d+\.\d+)\s*\((\d+)\+?\)/,

    // Distance: "1.9 km" or "0,7 km" (Turkish locale uses comma)
    DISTANCE: /([\d,.]+)\s*km/i,

    // Min basket: "Min. ₺260" or "Min. 260₺"
    MIN_BASKET: /Min\.\s*₺?(\d+)/i,

    // Delivery time: "25-35 dk"
    DELIVERY_TIME: /(\d+-\d+)\s*dk/,
} as const;

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
} as const;

/**
 * Timing constants
 */
export const TIMING = {
    DEBOUNCE_MS: 300,
    UNDO_BUFFER_SIZE: 5,
} as const;
