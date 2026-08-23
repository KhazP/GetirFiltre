# GetirFiltre Extension Improvements Design

This design document outlines the technical specifications for implementing the prioritized reliability, storage, and UX improvements to the GetirFiltre extension.

## 1. Reliability & Parser Improvements

### A. MutationObserver Lifecycle Management
* **Target File:** [src/content/index.tsx](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/content/index.tsx)
* **Design:**
  Store the active `MutationObserver` instance as a module-scoped variable `activeObserver`. When `setupObserver()` is called on initial run or route change, check if `activeObserver` exists, and call `.disconnect()` before creating a new one.
* **Code Change Blueprint:**
  ```typescript
  let activeObserver: MutationObserver | null = null;

  function setupObserver(): void {
      if (activeObserver) {
          activeObserver.disconnect();
          console.log('[GetirFiltre] Disconnected previous MutationObserver');
      }

      activeObserver = new MutationObserver((mutations) => {
          let hasNewNodes = false;
          for (const mutation of mutations) {
              if (mutation.addedNodes.length > 0) {
                  for (const node of mutation.addedNodes) {
                      if (node instanceof HTMLElement) {
                          if (node.tagName === 'ARTICLE' || node.querySelector?.('article')) {
                              hasNewNodes = true;
                              break;
                          }
                      }
                  }
              }
              if (hasNewNodes) break;
          }
          if (hasNewNodes) {
              debouncedRunFilter();
          }
      });

      activeObserver.observe(document.body, {
          childList: true,
          subtree: true,
      });
      console.log('[GetirFiltre] MutationObserver active');
  }
  ```

### B. Rating Parsing & Turkish Locale Normalization
* **Target File:** [src/content/dom-scanner.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/content/dom-scanner.ts) and [src/shared/constants.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/shared/constants.ts)
* **Design:**
  Update regexes to match commas as well as dots for rating values. Normalize the string by replacing commas with dots before passing to `parseFloat`.
* **Regex Updates:**
  ```typescript
  RATING: /^(\d[,.]\d)$/,
  RATING_WITH_REVIEWS: /(\d+[,.]\d+)\s*\(([\d.,]+)\+?\)/,
  ```
* **Normalizer Logic:**
  ```typescript
  const rating = parseFloat(match[1].replace(',', '.'));
  ```

### C. Thousands Separator Support for Review Counts
* **Target File:** [src/content/dom-scanner.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/content/dom-scanner.ts)
* **Design:**
  Update the review count capture group to capture digits along with dots and commas: `([\d.,]+)`. Strip dots/commas using `.replace(/[.,]/g, '')` before executing `parseInt(..., 10)`.
* **Example:** `(1.200+)` -> `1200` reviews.

### D. Single-Value Delivery Times Support
* **Target File:** [src/shared/constants.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/shared/constants.ts) and [src/content/dom-scanner.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/content/dom-scanner.ts)
* **Design:**
  Update `PARSE_PATTERNS.DELIVERY_TIME` to support a single integer optionally followed by a range: `/(\d+)(?:-\d+)?\s*dk/`. Update `extractDeliveryTime` and `parseDeliveryTimeMinutes` to handle this robustly.

---

## 2. Compliance with AGENTS.md (No Obfuscated Hashes)

### A. Layout-Based Sibling Hiding in Search Results
* **Target File:** [src/content/card-manipulator.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/content/card-manipulator.ts)
* **Design:**
  Replace `sibling.classList.contains('sc-f5b1a14a-2')` with structural heuristics:
  1. Check if the element does not contain a restaurant link (`a[href*="/yemek/restoran/"]`).
  2. Check if the element contains a price tag or menu item details (e.g. elements containing currency symbols or specific nested elements).
* **Code Change Blueprint:**
  ```typescript
  function isMenuItemSibling(element: Element): boolean {
      // Check if it is a restaurant link card (should not hide)
      if (element.querySelector('a[href*="/yemek/restoran/"]')) {
          return false;
      }
      // Check if it contains elements representing menu products (e.g., price formats, order buttons)
      const textContent = element.textContent || '';
      const hasPrice = textContent.includes('₺') || textContent.includes('TL');
      const isListItem = element.tagName === 'LI' || element.getAttribute('role') === 'listitem';
      
      return hasPrice || isListItem;
  }
  ```

---

## 3. Storage Optimization

### A. Move Blocklist to Chrome Storage Local
* **Target Files:** [src/shared/storage.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/shared/storage.ts)
* **Design:**
  Store user filter settings (isEnabled, minRating, maxMinBasket, etc.) in `chrome.storage.sync` (limited to 8KB). Store `blockedRestaurants` and `blockedKeywords` in `chrome.storage.local` (5MB+ capacity) to prevent sync quota exceeded errors.
* **State Loading Logic:**
  `getSettings()` will query both storage locations asynchronously, combine the results, and return a single unified `UserSettings` object.
* **State Writing Logic:**
  When `saveSettings()` is called, partition the settings object:
  - Write `blockedRestaurants` (and `blockedKeywords`) to `chrome.storage.local`.
  - Write the rest of the settings to `chrome.storage.sync`.
* **Sync Listener Logic:**
  Observe changes in both `sync` and `local` storage areas in `onSettingsChange` to guarantee instant real-time synchronization between popup adjustments and open tabs.

---

## 4. UI/UX Refinements

### A. Input Re-evaluation Debouncing
* **Target Files:** [src/popup/App.tsx](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/popup/App.tsx)
* **Design:**
  Currently, every single numeric keystroke triggers an immediate React state save and write to storage.
  We will introduce local temporary states in inputs and use `onBlur` or a key-down event listener (for `Enter`) to commit values to the global hook's `updateSetting` method.
  Alternatively, debounce the `updateSetting` callback using a timer.

### B. Card Fade-Out Animations
* **Target File:** [src/content/index.tsx](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/content/index.tsx) (CSS styles) and [src/content/card-manipulator.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/content/card-manipulator.ts)
* **Design:**
  Instead of instant `display: none !important`, apply a class `.getirfiltre-fading` which scales down and fades out card opacity over `0.25s`.
  Once the transition finishes, apply the `.getirfiltre-hidden` class (`display: none`).
  ```css
  .getirfiltre-fading {
    opacity: 0;
    transform: scale(0.95);
    transition: opacity 0.25s ease, transform 0.25s ease;
  }
  ```

---

## 5. Keyword/Category Blacklisting

### A. Core Filter Settings Update
* **Target Files:**
  - [src/shared/types.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/shared/types.ts)
  - [src/shared/storage.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/shared/storage.ts)
* **Design:**
  Add `blockedKeywords: string[]` to `UserSettings`.
  Update card filtering logic in [src/content/card-manipulator.ts](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/content/card-manipulator.ts):
  ```typescript
  // Apply keyword filter
  if (settings.blockedKeywords && settings.blockedKeywords.length > 0) {
      const cardTextLower = (card.name + ' ' + card.promotions.join(' ')).toLowerCase();
      const isKeywordBlocked = settings.blockedKeywords.some(keyword => 
          cardTextLower.includes(keyword.toLowerCase())
      );
      if (isKeywordBlocked) {
          hideCard(card.element);
          hiddenCount++;
          return;
      }
  }
  ```

### B. UI Blacklist Keyword Manager
* **Target Files:**
  - Add keyword management card in [src/popup/components/cards/BlockedKeywordsCard.tsx](file:///Users/alpyalay/Documents/GitHub/GetirFiltre/src/popup/components/cards/BlockedKeywordsCard.tsx)
  - Integrate in settings page dashboard.
