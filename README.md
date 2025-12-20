# GetirFiltre 🍕🚫

**"God Mode" for GetirYemek** — Hide restaurants you don't like and apply advanced filters beyond what the platform offers.

![GetirFiltre Demo](docs/demo.gif)

## ✨ Features

- **🚫 Restaurant Blacklist**: Click the X button on any restaurant card to permanently hide it
- **⭐ Minimum Rating Filter**: Only see restaurants above your minimum rating threshold
- **💰 Maximum Basket Limit**: Hide restaurants with minimum order amounts above your limit
- **🔄 Synced Settings**: Your preferences sync across Chrome browsers via your Google account
- **⚡ Instant Filtering**: Works with infinite scroll, new cards are filtered automatically

## 🚀 Installation

### From Source (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/GetirFiltre.git
   cd GetirFiltre
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Browser**
   - **Chrome**: Open `chrome://extensions/`
   - **Brave**: Open `brave://extensions/`
   - Enable **Developer mode** (toggle in top right)
   - Click **Load unpacked**
   - Select the `dist` folder from this project

5. **Visit GetirYemek**
   - Go to [getir.com/yemek/restoranlar](https://getir.com/yemek/restoranlar/)
   - Click the extension icon to configure filters
   - Hover over restaurant cards to see the block button

## 🎮 Usage

1. **Toggle On/Off**: Click the power button in the popup to enable/disable filtering
2. **Set Minimum Rating**: Enter a rating (e.g., 4.2) to hide restaurants below that rating
3. **Set Maximum Basket**: Enter an amount (e.g., 300) to hide restaurants requiring higher minimums
4. **Block a Restaurant**: Hover over any restaurant card and click the red X button
5. **Unblock**: Open the popup, expand "Engellenen Restoranlar", and click X next to any restaurant

## 🛠️ Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── content/          # Content script injected into GetirYemek
│   ├── index.tsx     # Main entry point & MutationObserver
│   ├── dom-scanner.ts    # Finds and parses restaurant cards
│   └── card-manipulator.ts # Hides cards, injects buttons
├── popup/            # Extension popup UI (React + Tailwind)
│   ├── App.tsx       # Main popup component
│   └── hooks/        # React hooks for settings
├── shared/           # Shared code between content & popup
│   ├── storage.ts    # Chrome storage wrapper
│   ├── types.ts      # TypeScript interfaces
│   └── constants.ts  # DOM selectors, patterns
└── background/       # Service worker (minimal)
```

## 🔧 Tech Stack

- **React 18** + TypeScript
- **Tailwind CSS** for styling
- **Vite** + **@crxjs/vite-plugin** for Chrome extension bundling
- **Chrome Storage API** for persistence

## 📝 License

MIT License - feel free to fork and modify!

---

Made with 💜 for everyone tired of scrolling past the same bad restaurants.
