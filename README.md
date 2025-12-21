# GetirFiltre 🍕🚫

**GetirYemek için "God Mode"** — Beğenmediğiniz restoranları gizleyin ve platformun sunduklarının ötesinde gelişmiş filtreler uygulayın.

![GetirFiltre Demo](docs/demo.gif)

## ✨ Özellikler

- **🚫 Restoran Engelleme Listesi**: Herhangi bir restoran kartındaki X düğmesine tıklayarak restoranı kalıcı olarak gizleyin
- **⭐ Minimum Puan Filtresi**: Sadece belirlediğiniz puan eşiğinin üzerindeki restoranları görün
- **💰 Maksimum Sepet Limiti**: Minimum sipariş tutarı limitinizin üzerinde olan restoranları gizleyin
- **🔄 Senkronize Ayarlar**: Tercihleriniz Google hesabınız üzerinden Chrome tarayıcıları arasında senkronize edilir
- **⚡ Anında Filtreleme**: Sonsuz kaydırma ile çalışır, yeni kartlar otomatik olarak filtrelenir

## 🚀 Kurulum

### Kaynaktan (Geliştirici Modu)

1. **Depoyu kopyalayın**
   ```bash
   git clone https://github.com/alpya/GetirFiltre.git
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
