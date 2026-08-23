import { describe, expect, it, beforeEach } from 'vitest';
import { processCards } from './card-manipulator';
// The real adapter, not a stub: processCards gained a platform parameter when
// TGO support landed, and testing against the actual Getir adapter is what
// keeps these cases honest about the code that ships.
import { getirAdapter } from './platforms/getir';
import { CSS_CLASSES } from '../shared/constants';
import { DEFAULT_SETTINGS, RestaurantCard, UserSettings } from '../shared/types';

function createCard(partial: Partial<RestaurantCard>): RestaurantCard {
  const element = document.createElement('article');
  element.className = 'test-card';
  document.body.appendChild(element);

  return {
    element,
    // hideTarget, platform and key became required when multi-platform support
    // landed; on Getir the hide target is the card element itself and the
    // storage key is the bare slug.
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


/**
 * Whether a card is on its way out.
 *
 * hideCard only adds the HIDDEN class on `transitionend`, and jsdom never fires
 * transitions — so asserting the class directly tests the animation, not the
 * filtering. The opacity is set synchronously and is the honest signal here;
 * the class is still accepted for a card that was already hidden.
 */
function isHiding(element: HTMLElement): boolean {
  return element.style.opacity === '0' || element.classList.contains(CSS_CLASSES.HIDDEN);
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
    expect(isHiding(card.element)).toBe(true);
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
    expect(isHiding(lowRatingCard.element)).toBe(true);
    expect(isHiding(farDistanceCard.element)).toBe(true);
    expect(isHiding(okCard.element)).toBe(false);
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
    expect(isHiding(plainCard.element)).toBe(true);
    expect(isHiding(promoCard.element)).toBe(false);
  });
});
