<p align="center">
  <img src="src/assets/icon128.png" width="80" height="80" alt="GetirFiltre logo">
</p>

# GetirFiltre

GetirYemek için God Mode: sevmediğiniz restoranları kalıcı olarak engelleyin, gelişmiş filtrelerle saniyeler içinde seçim yapın.

![GetirFiltre Demo](docs/demo.gif)

## Özellikler

- Her restoran kartında satıriçi X butonu ile kalıcı kara liste
- Minimum puan, maksimum sepet tutarı, minimum inceleme sayısı, maksimum mesafe filtreleri
- Sonsuz kaydırmada bile çalışan, gecikmeli MutationObserver tabanlı içerik betiği
- Ayarlar `chrome.storage.sync` ile oturumlar arasında senkronize
- Filtreler ve kara listeyi dışa/İçe aktarma

## Kurulum (geliştirici modu)

### Önkoşullar

- Node.js 20+
- npm 10+

```bash
git clone https://github.com/KhazP/GetirFiltre.git
cd GetirFiltre
npm install
npm run build
```

`dist` klasörünü paketlenmemiş uzantı olarak yükleyin:
- Chrome: chrome://extensions/ → Geliştirici Modu → Load unpacked → `dist`
- Brave: brave://extensions/ → Geliştirici Modu → Load unpacked → `dist`

Ardından https://getir.com/yemek/restoranlar/ adresinde uzantı ikonundan filtreleri açın, kartların üzerine gelerek engelleyin.

## Kullanım

- Popup üzerindeki ana anahtarla filtrelemeyi aç/kapat
- Ayarlar sayfasından (popup içindeki dişli) geniş görünüm ve liste yönetimi
- Kart üzerindeki kırmızı X ile anında engelleme

## Geliştirme

```bash
npm run dev    # Vite + CRX HMR
npm run build  # Üretim derlemesi
npm run test   # Birim testleri
```

## Yazılım Gereksinimleri

- Runtime ve bağımlılıklar: `package.json`
- Kilitli sürümler: `package-lock.json`
- TypeScript yapılandırması: `tsconfig.json`

## Dependency ve Katkı Teşekkürü

- React, TypeScript, Vite, CRXJS ve Tailwind topluluklarına teşekkürler.
- Katkı akışı ve davranış kuralları: `docs/CONTRIBUTING.md`, `docs/CODE_OF_CONDUCT.md`
- Güvenlik bildirimi: `docs/SECURITY.md`

## Klasörler

- src/content: GetirYemek içine enjekte edilen içerik betikleri
- src/popup: React + Tailwind popup arayüzü
- src/shared: Ortak tipler, storage yardımcıları, sabitler
- src/background: Servis çalışanı

## Teknoloji

- React 18 + TypeScript
- Vite + @crxjs/vite-plugin
- Tailwind CSS
- Chrome Storage API + MutationObserver

## Güvenlik ve katkı

- Güvenlik bildirimleri: SECURITY.md
- Katkı akışı: CONTRIBUTING.md ve CONTRIBUTING-GUIDE.md

## Lisans

Apache-2.0 (bkz. LICENSE).
