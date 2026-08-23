import { describe, expect, it, beforeEach } from 'vitest';
import { processCards } from './card-manipulator';
import { CSS_CLASSES } from '../shared/constants';

/**
 * Hiding is animated: the HIDDEN class is added on `transitionend`, which never
 * fires in jsdom. What is observable synchronously is the fade being started,
 * so that is what these assert — plus the PROCESSED marker and the returned
 * count, both of which are set immediately.
 */
const isHiding = (card: RestaurantCard) => card.hideTarget.style.opacity === '0';
import { DEFAULT_SETTINGS, RestaurantCard, UserSettings } from '../shared/types';
import { getirAdapter } from './platforms/getir';

function createCard(partial: Partial<RestaurantCard>): RestaurantCard {
  const element = document.createElement('article');
  element.className = 'test-card';
  document.body.appendChild(element);

  return {
    element,
    // Getir hides the card root itself; other platforms hide a wrapper.
    hideTarget: element,
    platform: 'getir',
    key: partial.slug ?? 'demo-slug',
    slug: 'demo-slug',
    name: 'Demo Restaurant',
    rating: 4.5,
    reviewCount: 120,
    minBasket: 100,
    deliveryTime: '20-30 dk',
    deliveryTimeMinutes: 30,
    distance: 1.2,
    isSponsored: false,
    promotions: [],
    ...partial,
  };
}

function settings(overrides: Partial<UserSettings>): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    isEnabled: false,
    ...overrides,
  };
}

describe('processCards', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('hides blocked restaurants', () => {
    const card = createCard({ slug: 'blocked-restaurant' });

    const hiddenCount = processCards(
      [card],
      settings({ blockedRestaurants: ['blocked-restaurant'] }),
      getirAdapter
    );

    expect(hiddenCount).toBe(1);
    expect(isHiding(card)).toBe(true);
    expect(card.element.classList.contains(CSS_CLASSES.PROCESSED)).toBe(true);
  });

  it('applies numeric filters', () => {
    const lowRatingCard = createCard({ slug: 'a', rating: 3.7 });
    const farDistanceCard = createCard({ slug: 'b', distance: 6.3 });
    const okCard = createCard({ slug: 'c', rating: 4.8, distance: 1.0 });

    const hiddenCount = processCards(
      [lowRatingCard, farDistanceCard, okCard],
      settings({ minRating: 4.0, maxDistance: 5 }),
      getirAdapter
    );

    expect(hiddenCount).toBe(2);
    expect(isHiding(lowRatingCard)).toBe(true);
    expect(isHiding(farDistanceCard)).toBe(true);
    expect(isHiding(okCard)).toBe(false);
  });

  it('hides non-promotional cards when promotions-only is enabled', () => {
    const plainCard = createCard({ slug: 'plain', promotions: [] });
    const promoCard = createCard({ slug: 'promo', promotions: ['%20 indirim'] });

    const hiddenCount = processCards(
      [plainCard, promoCard],
      settings({ showOnlyPromotions: true }),
      getirAdapter
    );

    expect(hiddenCount).toBe(1);
    expect(isHiding(plainCard)).toBe(true);
    expect(isHiding(promoCard)).toBe(false);
  });
});
