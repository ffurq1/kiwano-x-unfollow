# Kiwano • X Unfollow Assistant

X (Twitter) üzerinde sizi geri takip etmeyen hesapları toplu ve kontrollü bir şekilde takipten çıkarmanızı sağlayan kullanıcı betiği.

## İçindekiler

- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Ayarlar ve Filtreler](#ayarlar-ve-filtreler)
- [Limitler ve Güvenlik](#limitler-ve-güvenlik)
- [Lisans](#lisans)

---

## Özellikler

- **Geri Takip Filtresi:** X arayüz dili fark etmeksizin sizi geri takip eden kişileri tespit eder ve işlem dışında tutar.
- **24 Saatlik Sayaç Kontrolü:** Gün içinde çıkarılan hesap sayısını tarayıcı hafızasında tutar, 200 sınırına yaklaşıldığında uyarı vererek hesap kısıtlaması riskini azaltır.
- **Onaylı Hesap Koruması:** Mavi tikli hesapları işlem dışında tutabilirsiniz.
- **Kullanıcı Sınırı (Stop User):** Belirlediğiniz bir kullanıcı adına gelindiğinde işlemi durdurur; daha eski takip ettiğiniz kişileri korur.
- **Beyaz ve Kara Liste:** Takipten çıkılmayacak kişileri beyaz listeye, çıkarılanları kara listeye kaydedebilir; listeleri `.txt` olarak dışa/içe aktarabilirsiniz.
- **Hız ve Renk Seçenekleri:** İşlem aralıklarını (Normal, Hızlı, Turbo) ve arayüz temasını tercihinize göre ayarlayabilirsiniz.

---

## Kurulum

### 1. Tampermonkey Eklentisi
Tarayıcınıza uygun uzantıyı kurun:
- [Chrome Web Mağazası](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox Eklentileri](https://addons.mozilla.org/tr/firefox/addon/tampermonkey/)
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2. Betiğin Yüklenmesi

**Yöntem A (Doğrudan Kurulum):**
[kiwano-x-unfollow.user.js](https://raw.githubusercontent.com/furkvn7/kiwano-x-unfollow/main/kiwano-x-unfollow.user.js) bağlantısına tıklayın. Tampermonkey ekranı açıldığında **Kur (Install)** butonuna basın.

**Yöntem B (Manuel Kurulum):**
1. Tampermonkey menüsünden **Yeni betik ekle** seçeneğini açın.
2. [`script.js`](./script.js) dosyasındaki kodları editöre yapıştırın.
3. `Ctrl + S` (macOS için `Cmd + S`) kısayolu ile kaydedin.

---

## Kullanım

1. [x.com](https://x.com) üzerinde profilinize girip **Takip Edilenler** (`/following`) sayfasına gidin.
2. Sayfanın sağ alt köşesinde açılan Kiwano paneli üzerinden limit ve hız ayarlarınızı yapın.
3. Varsa korumak istediğiniz kullanıcı adlarını Beyaz Liste alanına ekleyin.
4. **Başlat** butonuna basın.

İşlemin kesintiye uğramaması için işlem süresince ilgili sekmeyi açık tutun ve simge durumuna küçültmeyin.

---

## Ayarlar ve Filtreler

| Seçenek | İşlev |
| :--- | :--- |
| **Mavi Tikli Hesapları Atla** | Onaylı hesapları işlem dışında bırakır. |
| **Bu kullanıcıya gelince dur** | Girilen kullanıcı adına ulaşıldığında işlemi otomatik sonlandırır. |
| **Çıkarma Limiti** | Tek seferde takipten çıkarılacak maksimum kişi sayısı. |
| **İşlem Hızı** | İstekler arasındaki bekleme süresi (Normal / Hızlı / Turbo). |
| **Rozet Gösterimi** | Kara listedeki kişilerin profilinde "Çıkarıldı" etiketi gösterir. |
| **Sayaç Sıfırlama** | Son 24 saatlik işlem geçmişini temizler. |

---

## Limitler ve Güvenlik

Bu araç kişisel hesap yönetimi için geliştirilmiştir. X platformunun günlük takipten çıkarma politikası değişiklik gösterebilir; genellikle 24 saat içinde 150-200 işlemden fazlası önerilmez. Hesabınızın güvenliği için limitleri aşmamanız tavsiye edilir.

---

## Lisans

Bu proje [MIT Lisansı](./LICENSE) altındadır.
