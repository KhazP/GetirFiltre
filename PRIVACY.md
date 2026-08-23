# Privacy Policy — GetirFiltre

**Last updated:** 23 August 2026

## Summary

GetirFiltre filters restaurant listings on Getir Yemek and TGO Yemek. It runs
entirely in your browser. It has no account, no login, and no server that
receives what you browse, order, or search for.

The only thing that ever leaves your device is a small, anonymous count of how
often the extension is used. You can switch that off.

## What the extension reads

To filter and sort a listing page, the extension reads the restaurant cards
already on that page — names, ratings, delivery times, and distances.

This happens in your browser and is **never transmitted anywhere**. The
extension has no host permissions and cannot read any site other than
`getir.com/yemek` and `tgoyemek.com`.

## What is stored on your device

| Stored | Where | Why |
|---|---|---|
| Your filter settings | `chrome.storage.sync` | So they follow you across your signed-in Chrome browsers |
| Your blocked restaurants | `chrome.storage.sync` | So a restaurant you blocked stays blocked |
| A random install ID | `chrome.storage.local` | So one install is counted once per day, not many times |
| A short event buffer | `chrome.storage.local` | Events waiting to be sent, cleared on send |

The install ID is a random UUID generated on your device. It is not derived from
anything about you, your browser, or your account, and it never leaves the
device except attached to the counts described below.

## Anonymous usage statistics

To know whether the extension is used at all, it sends a small batch at most
once every 30 minutes containing:

- the random install ID
- the extension version
- counts of these five event names, and nothing else:
  `ext_installed`, `ext_updated`, `ext_active`, `ext_filter_applied`,
  `ext_block_added`

That is the whole payload. **It never includes** restaurant names, prices,
search terms, addresses, order contents, page URLs, page text, your IP-based
location, or anything you typed.

It is sent to `alp-dashboard-api.alpyalay.workers.dev`, a server run by the
developer, and is used only to see whether the extension is worth maintaining.

### Turning it off

Open the extension's settings and switch off **Anonymous usage statistics**.
Turning it off immediately deletes the install ID and any buffered events, and
stops all sending. Turning it back on generates a new, unrelated ID.

## What is never collected

No personally identifiable information. No health data. No financial or payment
information. No passwords or credentials. No personal communications. No GPS or
address-level location. No browsing history. No page content.

## Third parties

Nothing is sold. Nothing is shared with any third party. There is no
advertising, no analytics SDK, and no tracking library in this extension.

## Permissions, and why each exists

| Permission | Why |
|---|---|
| `storage` | Save your filters and blocklist |
| `alarms` | Wake up every 30 minutes to send the batched counts |
| Site access to `getir.com/yemek`, `tgoyemek.com` | Read and filter the listing you are looking at |

## Contact

alpyalay@gmail.com — or open an issue at
https://github.com/KhazP/GetirFiltre/issues

---

# Gizlilik Politikası — GetirFiltre

**Son güncelleme:** 23 Ağustos 2026

## Özet

GetirFiltre, Getir Yemek ve TGO Yemek üzerindeki restoran listelerini filtreler.
Tamamen tarayıcınızda çalışır. Hesap yoktur, giriş yoktur ve neye baktığınızı,
ne sipariş ettiğinizi veya ne aradığınızı alan bir sunucu yoktur.

Cihazınızdan çıkan tek şey, eklentinin ne sıklıkta kullanıldığına dair küçük ve
anonim bir sayımdır. Bunu kapatabilirsiniz.

## Eklentinin okuduğu veriler

Bir liste sayfasını filtrelemek ve sıralamak için eklenti, o sayfada zaten
bulunan restoran kartlarını okur: ad, puan, teslimat süresi ve mesafe.

Bu işlem tarayıcınızda gerçekleşir ve **hiçbir yere gönderilmez**. Eklentinin
host izni yoktur; `getir.com/yemek` ve `tgoyemek.com` dışında hiçbir siteyi
okuyamaz.

## Cihazınızda saklananlar

| Saklanan | Nerede | Neden |
|---|---|---|
| Filtre ayarlarınız | `chrome.storage.sync` | Oturum açtığınız Chrome tarayıcıları arasında taşınsın diye |
| Engellediğiniz restoranlar | `chrome.storage.sync` | Engellediğiniz restoran engelli kalsın diye |
| Rastgele bir kurulum kimliği | `chrome.storage.local` | Bir kurulum günde bir kez sayılsın diye |
| Kısa bir olay tamponu | `chrome.storage.local` | Gönderilmeyi bekleyen olaylar; gönderimde temizlenir |

Kurulum kimliği, cihazınızda üretilen rastgele bir UUID'dir. Sizinle,
tarayıcınızla veya hesabınızla ilgili hiçbir şeyden türetilmez ve aşağıdaki
sayımlara eklenmesi dışında cihazdan çıkmaz.

## Anonim kullanım istatistikleri

Eklentinin kullanılıp kullanılmadığını anlamak için, en fazla 30 dakikada bir
şunları içeren küçük bir paket gönderilir:

- rastgele kurulum kimliği
- eklenti sürümü
- yalnızca şu beş olay adının sayıları: `ext_installed`, `ext_updated`,
  `ext_active`, `ext_filter_applied`, `ext_block_added`

Paketin tamamı budur. **Asla** restoran adları, fiyatlar, arama terimleri,
adresler, sipariş içerikleri, sayfa adresleri, sayfa metni, IP tabanlı konumunuz
veya yazdığınız hiçbir şey yer almaz.

Veriler, geliştirici tarafından işletilen
`alp-dashboard-api.alpyalay.workers.dev` adresine gönderilir ve yalnızca
eklentinin bakımını sürdürmeye değip değmediğini görmek için kullanılır.

### Kapatmak

Eklentinin ayarlarını açın ve **Anonim kullanım istatistikleri** seçeneğini
kapatın. Kapatıldığı anda kurulum kimliği ve bekleyen olaylar silinir, gönderim
tamamen durur. Yeniden açarsanız yeni ve ilişkisiz bir kimlik üretilir.

## Asla toplanmayanlar

Kimliğinizi belirleyen hiçbir bilgi. Sağlık verisi yok. Finansal veya ödeme
bilgisi yok. Parola veya kimlik bilgisi yok. Kişisel iletişim yok. GPS veya
adres düzeyinde konum yok. Tarama geçmişi yok. Sayfa içeriği yok.

## Üçüncü taraflar

Hiçbir şey satılmaz. Hiçbir şey üçüncü taraflarla paylaşılmaz. Bu eklentide
reklam, analitik SDK'sı veya izleme kütüphanesi yoktur.

## İzinler ve nedenleri

| İzin | Neden |
|---|---|
| `storage` | Filtrelerinizi ve engel listenizi kaydetmek |
| `alarms` | Toplu sayımları göndermek için 30 dakikada bir uyanmak |
| `getir.com/yemek`, `tgoyemek.com` erişimi | Baktığınız listeyi okuyup filtrelemek |

## İletişim

alpyalay@gmail.com — veya https://github.com/KhazP/GetirFiltre/issues
