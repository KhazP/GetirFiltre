# Product Requirements Document: GetirFiltre (MVP)
**"God Mode" for Your Food Feed**

| Project Info | Details |
| :--- | :--- |
| **Version** | 1.0 (MVP) |
| **Status** | Ready for Development |
| **Timeline** | 4 Weeks |
| **Target Audience** | "Picky Foodie Professionals" (Devs, PMs, Power Users) |
| **Core Vibe** | Minimalist, Fast, Empowering, Dark Mode |

---

## 1. Executive Summary
**The Vision:** GetirYemek (and similar platforms) are built to maximize ad revenue, not user efficiency. They force users to scroll past the same low-quality "ghost kitchens" and sponsored fast-food chains daily.

**GetirFiltre** is a Chrome Extension that hands control back to the user. It solves the "Paradox of Choice" by allowing users to permanently blacklist restaurants they hate and apply persistent, advanced filters (Rating + Price + Distance) that the native platform doesn't offer.

**The value proposition is time:** We turn a 10-minute "doom scroll" for lunch into a 30-second decision.

---

## 2. User Journey Story: "Cem’s Lunch Break"

**The Persona:** Cem (28), a Senior Backend Developer. He values efficiency, hates repetitive tasks, and orders lunch 4x a week.

### Scene 1: The Frustration (Before)
Cem opens GetirYemek at 12:30 PM. He is hungry. The feed loads, and immediately he sees "Döner King" (which gave him food poisoning once) and 15 different listings for "Burger X" (the same chain, just different branches). He sighs, scrolling past 50 options to find something decent. He wastes 12 minutes just looking.

### Scene 2: The Intervention (The Install)
Cem spots "GetirFiltre" on the Chrome Store. "Finally," he thinks. He installs it. No login required. No onboarding tutorial. Just works.

### Scene 3: The Purge (The "Ignore" Action)
He refreshes the Getir page.
1.  He sees "Döner King." A small, discreet **"X" button** appears on the card.
2.  He clicks it. *Poof.* The card vanishes instantly.
3.  He scrolls and sees a "3.2 Star" Pide place. Click. Gone.
4.  **Internal feeling:** Satisfaction. He is curating his own internet.

### Scene 4: The Precision (The Filtering)
Cem clicks the extension icon in his browser toolbar. A sleek, dark-mode panel opens.
1.  He sets **Min Rating** to **4.2**.
2.  He sets **Max Distance** to **2km** (he wants it hot).
3.  He toggles **"Auto-Hide"** on.

### Scene 5: The Result (The Value)
The page automatically refreshes the DOM. The 500+ list shrinks to **14 high-quality restaurants**.
He sees "Kristal Büfe" (4.7 stars, 1.2km). He orders.
**Total time elapsed:** 45 seconds.

### Scene 6: The Loop (Retention)
The next day, Cem opens GetirYemek. The filters are still active. "Döner King" is still gone. He sees a curated list immediately. He feels smart. He tells his Slack group about it.

---

## 3. Functional Requirements (The "Vibe-Coder" Blueprint)

### Core Feature A: The "Blacklist" Engine
*   **Trigger:** User hovers over a restaurant card.
*   **UI:** A small, semi-transparent "X" or "Block" button appears in the top-right corner of the card (z-index high).
*   **Action:**
    *   On click, the restaurant card is set to `display: none`.
    *   The restaurant's unique identifier (extract the **URL slug** from the `<a>` tag, NOT the class name) is saved to `chrome.storage.sync`.
*   **Persistence:** On future visits, the extension checks the storage before the user sees the page. If a URL matches, the card is hidden before it renders (or immediately after).

### Core Feature B: The "God Mode" Filter Panel
*   **UI:** Browser Action Popup (Dark theme).
*   **Inputs:**
    *   **Min Rating:** Number input (e.g., 4.0).
    *   **Min Basket Price:** "Max Limit" input (e.g., Don't show places with min basket > 300₺).
    *   **Toggle:** "Enable/Disable Filters" master switch.
    *   **Manage Ignore List:** A simple text list of blocked places with an "Unblock" button next to each.
*   **Logic:** The content script must parse the text content of the restaurant cards (regex match for "4.5", "20 dk", etc.) and hide cards that fail the criteria.

### Core Feature C: The DOM Watcher (MutationObserver)
*   **Problem:** Getir is a React SPA. Scrolling loads more items.
*   **Solution:** The extension must implement a `MutationObserver` on the main feed container.
*   **Behavior:** When new nodes (cards) are added to the DOM, the observer fires the "Filter & Block" function immediately.

---

## 4. UI/UX Guidelines
*   **Aesthetic:** "Hacker Minimalist."
*   **Color Palette:** Dark grays (`#1a1a1a`), vibrant accent color for active states (Neon Purple or Cyber Blue), pure white text.
*   **Typography:** Monospace for numbers (data), Sans-serif for labels.
*   **Feedback:**
    *   When filters are active, show a small badge on the extension icon (e.g., "12" hidden).
    *   Don't animate the hiding process too much—it should feel instantaneous (snappy).
*   **Language:** Turkish (Default) & English. Tone is direct: "Gizle" (Hide), "Filtrele" (Filter), "Engellenenler" (Blocked).

---

## 5. Technical Constraints & Architecture
*   **Manifest V3:** Mandatory.
*   **No External API:** Logic must happen client-side within the browser.
*   **Storage:** Use `chrome.storage.sync` for the blocklist (limit: 100KB, so store IDs/slugs only, not full objects).
*   **Selectors:** **CRITICAL:** Do not use CSS Classes (e.g., `.sc-1234`) as selectors; they change on every Getir deployment.
    *   *Strategy:* Find the Card by looking for the `<a>` tag containing `/restoran/` in the href. Traverse up the DOM tree to find the parent container to hide.

---

## 6. Success Metrics (KPIs)
1.  **Daily Active Users (DAU):** > 100 users active daily.
2.  **Engagement:** Average user has > 5 restaurants in their "Ignore List".
3.  **Retention:** Users return to the settings panel > 2x per week (tweaking filters).
4.  **Performance:** 500+ Installs in 3 months.
5.  **Quality:** 4.5+ Star Rating on Chrome Web Store.

---

## 7. Deferred Features (Post-MVP)
*   Cloud backup of ignore lists (outside Chrome Sync).
*   "Share my Blacklist" (Export JSON).
*   Keyword blocking (e.g., block all items containing "Sushi").
*   Highlighting "New" restaurants that haven't been seen before.