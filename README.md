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

## Proje Yapısı

```
src/
├── content/          # GetirYemek içine enjekte edilen içerik betiği
│   ├── index.tsx     # Ana giriş noktası & MutationObserver
│   ├── dom-scanner.ts    # Restoran kartlarını bulur ve ayrıştırır
│   ├── card-manipulator.ts # Kartları gizler, butonları enjekte eder
│   └── styles.css    # İçerik stili
├── popup/            # Uzantı popup arayüzü (React + Tailwind)
│   ├── App.tsx       # Ana popup bileşeni
│   ├── components/   # Alt bileşenler (Ayarlar Sayfası vb.)
│   └── hooks/        # Ayarlar için React hook'ları
├── shared/           # İçerik ve popup arasındaki ortak kodlar
│   ├── storage.ts    # Chrome storage sarmalayıcısı
│   ├── telemetry.ts  # Anonim kullanım sayaçları (kapatılabilir)
│   ├── types.ts      # TypeScript arayüzleri
│   └── constants.ts  # DOM seçicileri, desenler
└── background/       # Servis çalışanı (minimal)
```

## Yazılım Gereksinimleri

- Runtime ve bağımlılıklar: `package.json`
- Kilitli sürümler: `package-lock.json`
- TypeScript yapılandırması: `tsconfig.json`

## 🔒 Gizlilik

Restoran adları, engellenen kelimeler, filtre değerleri, adresler, fiyatlar ve
gezdiğiniz sayfalar **asla** cihazınızdan çıkmaz. Ayarlar `chrome.storage` içinde
kalır.

**Anonim kullanım istatistikleri** varsayılan olarak açıktır. En fazla 30 dakikada
bir (ve tarayıcı açılışında) şunlar gönderilir:

| Alan | Değer |
|------|-------|
| Uygulama adı | Sabit `getirfiltre` metni |
| Anahtar | Sabit, herkese açık, yalnızca spam filtresi |
| Kurulum kimliği | Kurulumda bir kez üretilen rastgele UUID; sizden veya cihazınızdan türetilmez |
| Sürüm | Eklenti sürümü |
| Olay sayıları | `ext_installed`, `ext_updated`, `ext_active`, `ext_filter_applied`, `ext_block_added` |

Bu beş ad sabittir; başka hiçbir ad gönderilemez. **Kapatmak için**: eklenti
panelinde **Ayarlar → Gizlilik**. Kapattığınızda kurulum kimliği ve bekleyen tüm
sayaçlar anında silinir. Yeniden açtığınızda yeni bir rastgele kimlik üretilir.

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
