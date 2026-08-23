# Katkı Rehberi

Teşekkürler! Başlamadan önce lütfen bu rehberi okuyun.

## Nasıl katkı verilir?
- **Hata bildirimi:** GitHub Issues üzerinden "Hata raporu" şablonunu kullanın.
- **Özellik isteği:** Issues içindeki "Özellik isteği" şablonunu kullanın.
- **Kod katkısı:** Bir issue referansı ile branch açın, küçük ve odaklı pull request gönderin.

## Geliştirme ortamı
- Node 18+
- `npm install`
- `npm run dev` ile içerik/popup için HMR
- `npm run build` ile üretim derlemesi

## Kodlama beklentileri
- TypeScript strict, `any` kullanmaktan kaçının.
- İçerik betiklerinde DOM seçicilerinde sınıf isimlerine güvenmeyin; göreli seçim ve doğrulama kullanın.
- Yeni davranışlar için test edilebilir küçük fonksiyonlara ayırın.
- Tailwind yardımcılarını tercih edin, gereksiz global CSS eklemeyin.

## PR kuralları
- Açıklayıcı başlık ve kısa özet.
- İlgili issue numarasını belirtin.
- Değişen davranışı anlatan kısa test notu ekleyin (elle denendi / tarayıcı, vb.).
- PR şablonunu doldurun; gereksiz bölümleri kaldırmayın.

## Kod incelemesi
- Küçük PR'lar hızlıca incelenir; büyük PR'lar bölünmelidir.
- Geri bildirimlere yanıt verin ve güncellediğinizde yorumu çözün.

## Lisans
- Katkılar Apache-2.0 lisansı altında kabul edilir. Kod göndererek bu lisans şartlarını kabul etmiş olursunuz.
