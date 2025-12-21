<p align="center">
  <img src="src/assets/icon128.png" width="80" height="80" alt="GetirFiltre Logo">
</p>

# GetirFiltre

**GetirYemek için Gelişmiş Filtreleme Eklentisi** — Beğenmediğiniz restoranları gizleyin ve platformun sunduklarının ötesinde gelişmiş filtreler uygulayın.

![GetirFiltre Demo](docs/demo.gif)

## ✨ Özellikler

- **🚫 Restoran Engelleme Listesi**: Herhangi bir restoran kartındaki X düğmesine tıklayarak restoranı kalıcı olarak gizleyin
- **⭐ Minimum Puan Filtresi**: Sadece belirlediğiniz puan eşiğinin üzerindeki restoranları görün
- **💰 Maksimum Sepet Limiti**: Minimum sipariş tutarı limitinizin üzerinde olan restoranları gizleyin
- **👁️ İnceleme Sayısı Filtresi**: Yeterli sayıda değerlendirmesi olmayan restoranları gizleyin
- **📏 Mesafe Filtresi**: Belirlediğiniz mesafeden uzak restoranları liste dışı bırakın
- **🔄 Senkronize Ayarlar**: Tercihleriniz Google hesabınız üzerinden Chrome tarayıcıları arasında senkronize edilir
- **⚡ Anında Filtreleme**: Sonsuz kaydırma ile çalışır, yeni kartlar otomatik olarak filtrelenir
- **💾 Dışa/İçe Aktar**: Ayarlarınızı ve engellenen restoran listenizi yedekleyin

## 🚀 Kurulum

### Kaynaktan (Geliştirici Modu)

1. **Depoyu kopyalayın**
   ```bash
   git clone https://github.com/USERNAME/GetirFiltre.git
   cd GetirFiltre
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Uzantıyı derleyin**
   ```bash
   npm run build
   ```

4. **Tarayıcıya Yükleyin**
   - **Chrome**: `chrome://extensions/` adresine gidin
   - **Brave**: `brave://extensions/` adresine gidin
   - **Geliştirici modu**nu etkinleştirin (sağ üst köşedeki anahtar)
   - **Paketlenmemiş öğe yükle** butonuna tıklayın
   - Bu projedeki `dist` klasörünü seçin

5. **GetirYemek'i Ziyaret Edin**
   - [getir.com/yemek/restoranlar](https://getir.com/yemek/restoranlar/) adresine gidin
   - Filtreleri yapılandırmak için uzantı simgesine tıklayın
   - Engelleme butonunu görmek için restoran kartlarının üzerine gelin

## 🎮 Kullanım

1. **Aç/Kapat**: Filtrelemeyi etkinleştirmek/devre dışı bırakmak için popup'taki güç düğmesine tıklayın.
2. **Ayarlar Sayfası**: Daha geniş bir görünüm ve detaylı yönetim için dişli çark simgesine tıklayarak ayarlar sayfasını yeni sekmede açın.
3. **Filtreleri Ayarla**: Puan, sepet tutarı, yorum sayısı ve mesafe limitlerini belirleyin.
4. **Restoran Engelle**: Herhangi bir restoran kartının üzerine gelin ve kırmızı X butonuna tıklayın.
5. **Engeli Kaldır**: Ayarlar sayfasından veya popup içindeki listeden engellenen restoranları yönetin.
6. **Yedekleme**: Ayarlar sayfasından yapılandırmanızı JSON dosyası olarak dışa aktarın.

## 🛠️ Geliştirme

```bash
# Hot reload ile geliştirme sunucusunu başlatın
npm run dev

# Üretim için derleyin
npm run build
```

## 📁 Proje Yapısı

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
│   ├── types.ts      # TypeScript arayüzleri
│   └── constants.ts  # DOM seçicileri, desenler
└── background/       # Servis çalışanı (minimal)
```

## 🔧 Teknoloji Yığını

- **React 18** + TypeScript
- **Tailwind CSS** stil için
- **Vite** + **@crxjs/vite-plugin** Chrome uzantı paketlemesi için
- **Chrome Storage API** verileri saklamak için

## 📝 Lisans

MIT Lisansı - çatallamakta ve değiştirmekte özgürsünüz!

---

Kötü restoranları kaydırmaktan sıkılan herkes için 💜 ile yapıldı.
