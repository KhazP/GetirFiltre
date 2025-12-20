Here is the **"Vibe-Code" Technical Design** for **GetirFiltre**. This document is optimized to be fed directly into an AI coding assistant (like Cursor, Windsurf, or GitHub Copilot) to generate the codebase rapidly.

---

# 1. Recommended Tech Stack
**Philosophy:** Lightweight, type-safe, and compatible with AI code generation patterns.

*   **Core Framework:** **React + TypeScript + Vite**.
    *   *Why:* Vite is blazing fast. TypeScript prevents 80% of runtime errors (crucial when AI writes the code). React makes building the "Filter Popup" UI trivial.
*   **Extension Build Tool:** **CRXJS Vite Plugin**.
    *   *Why:* It treats the `manifest.json` as the entry point and supports HMR (Hot Module Replacement) for content scripts. This is a game-changer for speed.
*   **Styling:** **Tailwind CSS**.
    *   *Why:* AI models are excellent at generating Tailwind utility classes. It keeps the extension bundle small (CSS purging) and ensures the "Dark Mode" aesthetic is easy to implement.
*   **State/Storage:** **Chrome Storage API + React Context**.
    *   *Why:* No external backend needed. Keeps it free and private. `chrome.storage.sync` syncs settings across the user's logged-in Chrome browsers.
*   **Icons:** **Lucide React**.
    *   *Why:* Clean, modern SVG icons that fit the "Hacker Minimalist" vibe.

---

# 2. Project Structure
A clean separation of concerns to prevent the AI from getting confused between the "Popup" (UI) and "Content Script" (Page Logic).

```text
getir-filtre/
├── manifest.json            # The brain of the extension
├── vite.config.ts           # Build configuration
├── tailwind.config.js       # Design system
├── src/
│   ├── background/          # Service workers (minimal logic)
│   │   └── index.ts
│   ├── content/             # The logic running inside GetirYemek
│   │   ├── index.ts         # Main entry point
│   │   ├── dom-scanner.ts   # Logic to find cards without CSS classes
│   │   ├── filters.ts       # Logic to parse text (Rating/Price)
│   │   ├── injector.tsx     # React component for the "X" button
│   │   └── styles.css       # Scoped styles for the "X" button
│   ├── popup/               # The Extension UI (Settings)
│   │   ├── index.html
│   │   ├── App.tsx          # Main Filter Panel
│   │   ├── components/      # Reusable UI (Toggle, Input, Badge)
│   │   └── hooks/           # useSettings() hook for storage
│   └── shared/              # Shared types and constants
│       ├── types.ts
│       └── storage.ts       # Helper wrappers for chrome.storage
```

---

# 3. Data Model (Schema)
Since we are using `chrome.storage.sync` (NoSQL-like JSON storage), strict typing is essential.

**`src/shared/types.ts`**

```typescript
// The Settings Object
interface UserSettings {
  isEnabled: boolean;          // Master toggle
  minRating: number;           // e.g., 4.2
  minBasketPrice: number | null; // e.g., 300 (Max limit for min basket)
  maxDistance: number | null;    // e.g., 2.5 (km)
  blockedRestaurants: string[];  // Array of slugs: ["doner-king-kadikoy", "burger-x-sisli"]
}

// The Restaurant Data (Scraped from DOM)
interface RestaurantCard {
  element: HTMLElement;        // The DOM node reference
  slug: string;                // "kristal-bufe-kadikoy" (Unique ID)
  name: string;                // "Kristal Büfe"
  rating: number;              // 4.7
  minBasket: number;           // 150
  distance: number;            // 1.2
  isSponsored: boolean;        // true/false
}
```

---

# 4. Core Logic Strategies (The "Secret Sauce")

### A. The "Anti-Fragile" DOM Selector
**Risk:** Getir changes class names (`.sc-123` -> `.sc-999`).
**Strategy:**
1.  **Anchor Search:** Find all `<a>` tags where `href` includes `/restoran/`.
2.  **Parent Traversal:** From the `<a>` tag, traverse up 3-4 levels.
3.  **Validation:** Check if the parent container has specific text nodes (e.g., "dk", "TL", "★"). If yes, that's our Card.

### B. The "Mutation Observer" (Infinite Scroll)
**Risk:** Performance lag when scrolling.
**Strategy:**
1.  Observe `document.body` for `childList` changes.
2.  **Debounce:** Only run the filter logic once every 200ms, even if 50 DOM updates happen.
3.  **Marker Class:** Once a card is processed, add a custom attribute `data-getirfiltre-processed="true"`. Skip these in future scans.

---

# 5. Step-by-Step Build Plan

## Phase 1: The Skeleton (Day 1)
*   **Goal:** A "Hello World" extension that opens a popup and logs to the console on Getir.com.
*   **Action:** Initialize Vite + React + CRXJS. Configure `manifest.json` with permissions (`storage`, `activeTab`, `scripting`).

## Phase 2: The Scraper (Day 2-3)
*   **Goal:** Accurately identify restaurant cards and extract data (Rating, Price).
*   **Action:** Write `dom-scanner.ts`. Test it by `console.table()` the data it finds on the page. Refine the Regex for parsing Turkish numbers (e.g., "4,5" -> 4.5).

## Phase 3: The Executioner (Day 4)
*   **Goal:** Hide cards based on a hardcoded list.
*   **Action:** Implement the `blockedRestaurants` logic. Add the visual "X" button (using `ReactDOM.createRoot` to inject a React component directly into the DOM card).

## Phase 4: The Control Panel (Day 5)
*   **Goal:** User interface to change settings.
*   **Action:** Build the Popup UI with Tailwind. Create the `useStorage` hook to save/load settings instantly.

## Phase 5: The Watcher (Day 6)
*   **Goal:** Make it work while scrolling.
*   **Action:** Implement the `MutationObserver`. Ensure the "X" buttons appear on new cards loaded via infinite scroll.

---

# 6. AI Prompts (Copy & Paste)

Use these prompts in order with your AI coding tool.

### Prompt 1: Project Setup
> "Act as a Senior Frontend Architect. Create a chrome extension project using Vite, React, TypeScript, Tailwind CSS, and @crxjs/vite-plugin. I need a manifest v3 configuration.
>
> Structure the project with `src/popup`, `src/content`, and `src/background`.
> Configure Tailwind to work within the Shadow DOM or content scripts if necessary (or just standard CSS injection).
> Provide the `vite.config.ts`, `manifest.json`, and `package.json` scripts. The content script should only run on `*://getir.com/*`."

### Prompt 2: The "Fragile" DOM Parser (Crucial)
> "I need a TypeScript function for the content script that identifies restaurant cards on GetirYemek.
> **Constraint:** Do NOT use specific CSS class names (like `.sc-d5f4`) because they are obfuscated and change often.
> **Logic:**
> 1. Find all `<a>` tags containing '/restoran/' in the href.
> 2. Traverse up the DOM tree (max 5 levels) to find the main container Card.
> 3. Extract the following data using Regex from the card's inner text: Rating (e.g., '4.5'), Min Basket Price, and URL Slug.
> 4. Return an array of `RestaurantCard` objects.
> Write this in `src/content/dom-scanner.ts`."

### Prompt 3: The Filter Logic & MutationObserver
> "Create a `src/content/index.ts` script.
> 1. It should load settings from `chrome.storage.sync`.
> 2. It should use `MutationObserver` to watch `document.body` for new nodes.
> 3. When changes occur, debounce the execution by 300ms.
> 4. Run the scanner from Prompt 2.
> 5. If a restaurant's slug is in the `blockedRestaurants` list OR its rating is below `minRating`, apply `display: none` to the card element.
> 6. Add a console log showing how many items were hidden."

### Prompt 4: The Popup UI (Vibe)
> "Create the Popup UI in `src/popup/App.tsx`.
> **Design:** Dark mode, 'Hacker Minimalist' aesthetic using Tailwind. Colors: Dark Gray background, Neon Purple accents.
> **Features:**
> 1. A Master Toggle (Enable/Disable).
> 2. Number input for 'Min Rating' (Step 0.1).
> 3. Range slider or input for 'Max Distance'.
> 4. A list of 'Blocked Restaurants' (just show the count, e.g., '12 Blocked') with a 'Clear All' button.
> Use `chrome.storage.sync` to save these values immediately on change."

### Prompt 5: Injecting the "X" Button
> "I need to inject a small 'X' button into every valid restaurant card found on the page.
> 1. Create a React component `BlockButton.tsx` that is a small, semi-transparent red square with an 'X' icon.
> 2. In the content script, for every processed card, create a container `div`, append it to the card's top-right corner (using `position: absolute`), and render the `BlockButton` into it.
> 3. Clicking the button should add the restaurant's slug to `chrome.storage.sync` and immediately hide the card."