# Agent Guidance

**GetirFiltre** is a Manifest V3 Chrome extension for Turkish food-delivery
sites — **GetirYemek** (`getir.com/yemek`) and **Uber Eats Trendyol Go**
(`tgoyemek.com`). It lets users permanently blacklist restaurants and apply
persistent filters (rating, price, distance) to stop doom-scrolling.

The extension is **built** — `src/{background,content,popup,options,shared}`
exist. Treat this as a working codebase, not a greenfield spec.

## Platform adapters

Every site-specific assumption lives in `src/content/platforms/` behind the
`PlatformAdapter` interface: URL shapes, card lookup, field parsing, section
hiding, the mutation hint and the hover CSS. The content script is
site-agnostic — **add a site by adding an adapter**, never by branching on the
hostname in `index.tsx`.

- One filter decision, one place: `shouldHideCard()` in `card-manipulator.ts`.
  First pass and re-evaluation after a settings change both go through it, so
  the rules cannot drift apart.
- Blocklist entries are **storage keys**, not raw slugs: bare slug on Getir
  (legacy data), `tgo:<id>` elsewhere. Numeric ids are unreadable, so the
  display name is kept in `blockedNames`.
- Number formats differ per site. Trendyol Go writes `Min. 2.000 TL` (dot =
  thousands separator), `30-40dk`, and renders sub-kilometre distances as
  `0.5m`. Never reuse another platform's regex without checking it live.

## The one hard problem: the host DOM is hostile

Everything below exists because the host page fights the extension.

- **Class names are obfuscated and dynamic** (`.style__Card-sc...`) and they
  change without notice. **Never key off a class hash alone.** Match on
  structure or attributes instead — e.g. "the `div` containing an `img` and a
  price-formatted string". A selector that works today is not a selector that
  works next week. Trendyol Go is kinder: it tags card fields with `id`
  attributes (`#distance`, `#min-basket-price`), but the ids repeat on every
  card — query them **inside** the card, never with `getElementById`.
- **It's a SPA with infinite scroll**, so cards appear after load. One
  `MutationObserver` at the root of the feed container, and **debounce the
  processing** — running per-mutation freezes the page during a scroll.
- **Injected elements must not fight React's hydration.** Append a plain DOM
  node with a unique ID, or use a React Portal — never render into a node the
  host owns.
- **Z-index war:** injected UI must sit above cards but must never cover Getir's
  own critical UI, especially the cart.
- **Tailwind must not bleed into the host page.** CRXJS scopes it, but verify
  when adding global styles.

## Failure policy

**A parse failure must never break the Getir page.** Wrap content-script entry
points in `try/catch` and log a discreet warning instead of throwing — a broken
extension that leaves the site usable is a bug; one that takes the site down is
an incident. Handle `chrome.runtime.lastError` explicitly.

## State

`chrome.storage.sync` is the **source of truth**, not React state. React mirrors
it through a `useChromeStorage`-style hook that subscribes to storage change
events, so a change in one surface (popup, options, content script) shows up in
the others without a reload.

## Conventions

- **No `any`** — use `unknown` or define the interface. The DOM is volatile, so
  assume `querySelector` returns `null` and use `?.` aggressively.
- Shared interfaces (`Restaurant`, `FilterSettings`) live in `src/shared/`, not
  beside their consumers.
- The popup supports **dark mode by default**.

## Working style

Terse and direct. Lead with the code, skip the explanation of standard
React/TypeScript unless asked.

## User communication

Always use ASD-STE100 Simplified Technical English when talking to the user.
