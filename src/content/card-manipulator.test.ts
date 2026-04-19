import { describe, expect, it, beforeEach } from 'vitest';
import { processCards } from './card-manipulator';
import { CSS_CLASSES } from '../shared/constants';
import { DEFAULT_SETTINGS, RestaurantCard, UserSettings } from '../shared/types';

function createCard(partial: Partial<RestaurantCard>): RestaurantCard {
  const element = document.createElement('article');
  element.className = 'test-card';
  document.body.appendChild(element);

  return {
    element,
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
      settings({ blockedRestaurants: ['blocked-restaurant'] })
    );

    expect(hiddenCount).toBe(1);
    expect(card.element.classList.contains(CSS_CLASSES.HIDDEN)).toBe(true);
    expect(card.element.classList.contains(CSS_CLASSES.PROCESSED)).toBe(true);
  });

  it('applies numeric filters', () => {
    const lowRatingCard = createCard({ slug: 'a', rating: 3.7 });
    const farDistanceCard = createCard({ slug: 'b', distance: 6.3 });
    const okCard = createCard({ slug: 'c', rating: 4.8, distance: 1.0 });

    const hiddenCount = processCards(
      [lowRatingCard, farDistanceCard, okCard],
      settings({ minRating: 4.0, maxDistance: 5 })
    );

    expect(hiddenCount).toBe(2);
    expect(lowRatingCard.element.classList.contains(CSS_CLASSES.HIDDEN)).toBe(true);
    expect(farDistanceCard.element.classList.contains(CSS_CLASSES.HIDDEN)).toBe(true);
    expect(okCard.element.classList.contains(CSS_CLASSES.HIDDEN)).toBe(false);
  });

  it('hides non-promotional cards when promotions-only is enabled', () => {
    const plainCard = createCard({ slug: 'plain', promotions: [] });
    const promoCard = createCard({ slug: 'promo', promotions: ['%20 indirim'] });

    const hiddenCount = processCards(
      [plainCard, promoCard],
      settings({ showOnlyPromotions: true })
    );

    expect(hiddenCount).toBe(1);
    expect(plainCard.element.classList.contains(CSS_CLASSES.HIDDEN)).toBe(true);
    expect(promoCard.element.classList.contains(CSS_CLASSES.HIDDEN)).toBe(false);
  });
});
