This deep research report validates your "GetirYemek Vibe-Coder" concept and provides a technical blueprint for building it.

### **Executive Summary**
*   **Verdict:** **HIGHLY FEASIBLE**. This is a classic "Blue Ocean" niche. No direct competitors exist for GetirYemek, and the technical barriers are low enough for a free browser extension.
*   **Market Gap:** Users are frustrated by the "paradox of choice" and repetitive listings. Your solution solves a real pain point that the platform ignores to maximize ad revenue.
*   **Technical Path:** You can build this using **Manifest V3**, **MutationObserver** (for the React feed), and **Chrome Sync Storage** (for the ignore list). No complex servers or APIs are needed.

---

### **1. Market Validation & Audience**
*   **The Problem is Real:** User forums and complaint sites (like *Şikayetvar*) show GetirYemek users are frustrated by "spammy" listings—ghost kitchens (same food, different brand names) and repetitive fast-food chains cluttering their feed.
*   **Why Getir Won't Fix It:** Food delivery platforms charge restaurants for "promoted" placement. Allowing users to permanently hide these paying customers hurts Getir's ad revenue. This is why your extension is necessary—it empowers the user against the algorithm.
*   **Target User:** The "Power User" who orders 3+ times a week, has specific dietary needs (keto, vegan), or simply hates seeing the same 5 bad burger joints every day.

---

### **2. Competitive Analysis**
| Solution | Pros | Cons | Your Advantage |
| :--- | :--- | :--- | :--- |
| **Native Getir Filters** | Built-in, easy to access. | Resets every session; cannot combine complex logic (e.g., "Rating > 4.5 AND Price < 500TL"). | **Persistence.** Your filters stay set forever. |
| **Manual Scrolling** | Free. | Wastes ~10 mins/order; cognitive load. | **Speed.** You save them that 10 minutes instantly. |
| **General Ad Blockers** | Hides ads. | Doesn't understand "restaurants"; can't filter by price/distance. | **Context.** Your tool understands *restaurant data*. |
| **Your Extension** | **Permanent Blacklist + Smart Filters.** | Requires installation. | **The "God Mode" experience for ordering food.** |

---

### **3. Technical Feasibility & Architecture (The "Vibe-Coder" Blueprint)**

Since you are a "Vibe-Coder" (likely using AI tools to help build), here is the specific prompt-ready architecture you need.

#### **A. The Core Technology: `MutationObserver`**
GetirYemek is a **React Single Page Application (SPA)**. This means the page doesn't reload when you scroll; it just "paints" new restaurant cards.
*   **Challenge:** You can't just run a script once. New restaurants appear as you scroll.
*   **Solution:** Use a `MutationObserver`. It’s a piece of code that "watches" the restaurant list container. Every time Getir adds a new restaurant card, your extension instantly checks it against your blacklist and hides it before the user even notices.

#### **B. The "Ignore List" Storage**
*   **Tool:** `chrome.storage.sync`
*   **Why:** It syncs across all computers where the user is logged into Chrome.
*   **Quota Warning:** You have 100KB of space.
    *   *Bad Way:* Storing the whole restaurant object `{ name: "Burger King", id: 123, img: "..." }`. You will run out of space after ~50 restaurants.
    *   *Good Way:* Store **only the ID** in a simple array: `[12345, 67890, 11223]`. You can store roughly **8,000+ restaurants** this way, which is plenty.

#### **C. Identifying Restaurants (The Tricky Part)**
React apps often randomize class names (e.g., `<div class="sc-AxjAm gHyYt">`).
*   **Strategy:** Do **not** rely on class names like `card-wrapper`. They will break next week.
*   **The "Anchor" Trick:** Look for the link (`<a href="...">`) inside the card. The URL usually contains the stable ID or slug (e.g., `/restoran/burger-king-kadikoy`). Use this URL as the unique ID for your blacklist.

---

### **4. Implementation Plan (Step-by-Step)**

#### **Phase 1: The "Hider" (MVP)**
*   **Goal:** Right-click a restaurant -> "Hide this Restaurant".
*   **Build:**
    1.  **Manifest V3:** Standard extension setup.
    2.  **Content Script:** Finds restaurant cards. Adds a small "X" button to the top-right of each card.
    3.  **Storage:** When "X" is clicked, save the restaurant URL/ID to `chrome.storage.sync`.
    4.  **Auto-Hide:** On page load (and scroll), check the list and apply `display: none` to matches.

#### **Phase 2: The "Filter Engine"**
*   **Goal:** A popup menu to set "Min Rating: 4.5" and "Max Delivery Fee: 20 TL".
*   **Build:**
    1.  **Popup UI:** Simple HTML/CSS inputs.
    2.  **Parser:** The content script must "read" the text on the card (e.g., find the text "4.2" or "Free Delivery").
    3.  **Logic:** If `(Rating < UserRating) OR (Price > UserPrice)`, apply `display: none`.

---

### **5. "Vibe-Coder" Prompt Strategy**
When you are ready to build, copy-paste these prompts into your AI coding assistant (Cursor/Windsurf/ChatGPT):

**Prompt 1 (Setup):**
> "Create a manifest.json for a Chrome Extension (Manifest V3) called 'GetirYemek Filter'. It needs permissions for 'storage' and 'activeTab'. It should run a content script on 'getir.com/yemek/*'."

**Prompt 2 (The Observer):**
> "Write a content script that uses a MutationObserver to watch for new restaurant cards being added to the DOM. Since class names are obfuscated, please write a function that identifies restaurant cards by looking for an <a> tag that links to a restaurant detail page. Log 'New restaurant found: [URL]' to the console for every card found."

**Prompt 3 (The Blocker):**
> "Update the script to check `chrome.storage.sync` for a list of banned URLs. If a found restaurant's URL is in the list, set its style to `display: none` immediately. Add a small absolute-positioned 'Block' button to the top right of every visible restaurant card."

### **Final Recommendation**
This is a perfect starter project. It uses **zero server costs**, solves a **high-friction problem**, and the "Secret Sauce" (persistent sync) is natively supported by Chrome. Start by simply manually hiding one restaurant by its URL, and the rest will follow easily.