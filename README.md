# 🍈 Kiwano • X (Twitter) Unfollow Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Tampermonkey-Supported-00485B?style=for-the-badge&logo=tampermonkey&logoColor=white" alt="Tampermonkey" />
  <img src="https://img.shields.io/badge/Version-1.0.0-f59e0b?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/UI-Shadcn%20%2F%20Linear-black?style=for-the-badge" alt="UI" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong>Shadcn & Linear UI</strong> tasarım diline sahip, çok dilli destek, akıllı filtreleme ve <strong>24 saatlik shadowban koruması</strong> sunan profesyonel bir X (Twitter) kullanıcı deneyimi aracı. Sizi geri takip etmeyen hesapları tespit eder ve güvenli bir hızda takipten çıkarır.
</p>

---

## ✨ Özellikler

* 🎨 **Modern & Minimalist Arayüz:** Shadcn ve Linear tasarım çizgilerinde koyu tema, mikro etkileşimler, akıcı animasyonlar ve küçültülebilir kompakt panel.
* 🛡️ **24 Saatlik Akıllı Shadowban Koruması:** Son 24 saat içinde çıkardığınız hesap sayısını yerel hafızada tutarak 200 sınırını aşmanızı önler, risk durumunda kullanıcıyı uyarır.
* 🌐 **Çok Dilli Geri Takip Algılama:** X arayüzünü Türkçe, İngilizce, İspanyolca, Almanca veya diğer dillerde kullansanız dahi sizi geri takip edenleri hatasız algılar.
* 💎 **Mavi Tik & Onaylı Hesap Koruması:** Tek anahtarla mavi tikli / doğrulanmış hesapları filtreleyip koruma altına alabilirsiniz.
* ⏱️ **Kronolojik Sınır:** Belirlediğiniz bir kullanıcı adına gelindiğinde işlemi otomatik durdurarak daha eski takip ettiğiniz kişileri korur.
* 📋 **Dinamik Beyaz & Kara Liste:**
  * **Beyaz Liste:** Asla takipten çıkmak istemediğiniz kişileri korur.
  * **Kara Liste:** Önceden çıkarılan hesapları kaydeder ve profillerinin yanına *"Çıkarıldı"* rozeti ekler.
  * Her iki listeyi de `.txt` olarak tek tıkla dışa/içe aktarabilirsiniz.
* ⚡ **3 Farklı Hız Modu:** Normal (en güvenli), Hızlı (önerilen) ve Turbo (seri).
* 🌈 **5 Renk Teması:** Kiwano Altın, Klasik Beyaz (Zinc), X Mavisi, Zümrüt Yeşili ve Gece Moru.

---

## 🚀 Hızlı Kurulum

### 1. Tampermonkey Eklentisi
Tarayıcınıza uygun Tampermonkey uzantısını kurun:
* [Chrome Web Mağazası](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* [Firefox Eklentileri](https://addons.mozilla.org/tr/firefox/addon/tampermonkey/)
* [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2. Betiği Yükleyin
En kolay yol:
1. Tarayıcınızda [kiwano-x-unfollow.user.js](https://raw.githubusercontent.com/furkvn/kiwano-x-unfollow/main/kiwano-x-unfollow.user.js) bağlantısına tıklayın.
2. Açılan Tampermonkey ekranında **"Kur" (Install)** butonuna basın.

*Alternatif Manuel Kurulum:*
1. Tampermonkey simgesine tıklayıp **"Yeni betik ekle"** deyin.
2. [`script.js`](./script.js) içeriğini kopyalayıp editöre yapıştırın ve **Ctrl + S** (Cmd + S) ile kaydedin.

---

## 📖 Kullanım Rehberi

1. [x.com](https://x.com) adresine gidin ve profilinizdeki **Takip Edilenler (Following)** sekmesini açın.
2. Sağ alt köşede **Kiwano Assistant** paneli otomatik olarak belirecektir.
3. Çıkarmak istediğiniz limit sayısını ve işlem hızını belirleyin.
4. Varsa korumak istediğiniz kullanıcıları Beyaz Liste'ye ekleyin.
5. **Başlat** butonuna basarak işlemi başlatın.

> 💡 **Önemli İpuçları:**
> - İşlem esnasında sekmeden ayrılmayın veya pencereyi simge durumuna küçültmeyin (tarayıcılar arka plan sekmelerinde zamanlayıcıları kısıtlayabilir).
> - Twitter'ın günlük güvenli takipten çıkarma limiti ~200 kullanıcıdır. 24 saatlik sayacınızı panel ayarlarından takip edebilirsiniz.

---

## ⚙️ Yapılandırma & Ayarlar

| Ayar | Açıklama |
| --- | --- |
| **Mavi Tikli Hesapları Atla** | Doğrulanmış hesapları es geçer. |
| **Bu kullanıcıya gelince DUR** | Belirttiğiniz `@kullanici` adına ulaşıldığında işlem otomatik sonlanır. |
| **Çıkarma Limiti** | Tek seferde çıkarılacak maksimum kişi sayısı (varsayılan: 50). |
| **İşlem Hızı** | İstekler arasındaki bekleme süresini ayarlar (Normal / Hızlı / Turbo). |
| **Çıkarıldı Rozetleri** | Kara listedeki kişilerin yanında kırmızı *"Çıkarıldı"* etiketi gösterir. |
| **Sayaç Sıfırlama** | 24 saatlik yerel unfollow geçmişini sıfırlar. |

---

## 🍈 Kiwano Ekosistemi

Bu proje, günlük dijital işleri hızlandırmak ve keyifli hale getirmek amacıyla geliştirilen **Kiwano Mini Araçlar & Betikler** serisinin bir parçasıdır.

---

## ⚠️ Yasal Uyarı & Sorumluluk Reddi

Bu betik tamamen kişisel kullanım, eğitim ve otomasyon araştırması amacıyla hazırlanmıştır. X (Twitter) platform kuralları ve kullanım koşulları zamanla değişebilir. Aşırı limit kullanımı hesap kısıtlamalarına yol açabilir. Kullanımdan doğabilecek her türlü sorumluluk kullanıcıya aittir.

---

## 📄 Lisans

Bu proje [MIT Lisansı](./LICENSE) kapsamında lisanslanmıştır. Dilediğiniz gibi kullanabilir, çatallayabilir ve katkıda bulunabilirsiniz.
