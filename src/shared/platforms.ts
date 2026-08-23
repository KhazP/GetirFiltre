import { PlatformId, UserSettings } from './types';

/**
 * Which settings a platform can actually apply.
 * A filter that the site cannot support is hidden in the popup, not disabled -
 * a control that does nothing is worse than no control.
 */
export type FeatureKey = Extract<
    keyof UserSettings,
    | 'minRating'
    | 'maxMinBasket'
    | 'minReviewCount'
    | 'maxDistance'
    | 'maxDeliveryTime'
    | 'showOnlyPromotions'
    | 'hideSponsored'
    | 'hideCampaignCarousel'
    | 'hideMudavimSection'
    | 'hideAciktiysanSection'
>;

const CARD_FILTERS: FeatureKey[] = [
    'minRating',
    'maxMinBasket',
    'minReviewCount',
    'maxDistance',
    'maxDeliveryTime',
    'showOnlyPromotions',
    'hideSponsored',
];

export interface PlatformInfo {
    id: PlatformId;
    /** Product name shown in the popup */
    brand: string;
    /** Site name, for tooltips and messages */
    site: string;
    /** Matches the page URL */
    hostPattern: RegExp;
    /** Toolbar badge colour */
    badgeColor: string;
    features: FeatureKey[];
}

export const PLATFORMS: Record<PlatformId, PlatformInfo> = {
    getir: {
        id: 'getir',
        brand: 'GetirFiltre',
        site: 'GetirYemek',
        hostPattern: /:\/\/(www\.)?getir\.com\/yemek/,
        badgeColor: '#a855f7',
        features: [
            ...CARD_FILTERS,
            'hideCampaignCarousel',
            'hideMudavimSection',
            'hideAciktiysanSection',
        ],
    },
    tgo: {
        id: 'tgo',
        brand: 'UberFiltre',
        site: 'Uber Eats Trendyol Go',
        hostPattern: /:\/\/(www\.)?tgoyemek\.com/,
        badgeColor: '#06c167',
        // No Müdavim or ACIKTIYSAN sections on this site
        features: [...CARD_FILTERS, 'hideCampaignCarousel'],
    },
};

/** Branding used when the popup is open away from a supported site. */
export const DEFAULT_PLATFORM_ID: PlatformId = 'getir';

export function platformFromUrl(url: string | undefined): PlatformInfo | null {
    if (!url) return null;
    return Object.values(PLATFORMS).find((platform) => platform.hostPattern.test(url)) ?? null;
}

export function supports(platform: PlatformInfo, feature: FeatureKey): boolean {
    return platform.features.includes(feature);
}
